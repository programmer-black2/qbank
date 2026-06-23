# accounts/serializers.py
import hashlib
import random
import re
import uuid
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from .models import Role
from .sms import sendSMS


OTP_EXPIRE_MINUTES = 2
OTP_MAX_ATTEMPTS = 5
OTP_PURPOSE_REGISTER = "register"
OTP_PURPOSE_LOGIN = "login"


def normalize_phone(value):
    digit_map = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    return str(value or "").strip().translate(digit_map)


def validate_iran_mobile(value):
    phone = normalize_phone(value)
    if not re.match(r"^09[0-9]{9}$", phone):
        raise serializers.ValidationError("شماره موبایل باید با 09 شروع شود و 11 رقم باشد")
    return phone


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def hash_otp(code):
    return hashlib.sha256(str(code).encode("utf-8")).hexdigest()


def normalize_device_name(value):
    return str(value or "")[:120]


def set_user_otp(user, purpose):
    code = f"{random.SystemRandom().randint(10000000, 99999999)}"
    user.otp_purpose = purpose
    user.otp_code_hash = code
    user.otp_expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    user.otp_attempts = 0
    user.save(update_fields=[
        "otp_purpose",
        "otp_code_hash",
        "otp_expires_at",
        "otp_attempts",
        "updated_at",
    ])
    return code


def clear_user_otp(user):
    user.otp_purpose = None
    user.otp_code_hash = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    user.save(update_fields=[
        "otp_purpose",
        "otp_code_hash",
        "otp_expires_at",
        "otp_attempts",
        "updated_at",
    ])


def validate_user_otp(user, code, purpose):
    if user.otp_purpose != purpose or not user.otp_code_hash:
        raise serializers.ValidationError("کد تایید معتبر نیست")

    if not user.otp_expires_at or timezone.now() >= user.otp_expires_at:
        clear_user_otp(user)
        raise serializers.ValidationError("کد تایید منقضی شده است")

    if user.otp_attempts >= OTP_MAX_ATTEMPTS:
        clear_user_otp(user)
        raise serializers.ValidationError("تعداد تلاش‌ها بیش از حد مجاز است")

    submitted_code = normalize_phone(code)
    if user.otp_code_hash not in {submitted_code, hash_otp(submitted_code)}:
        user.otp_attempts += 1
        user.save(update_fields=["otp_attempts", "updated_at"])
        raise serializers.ValidationError("کد تایید اشتباه است")


def make_student_token_response(user, request, device_name=""):
    session_key = str(uuid.uuid4())
    user.active_student_session_key = session_key
    user.active_device_name = normalize_device_name(device_name)
    user.active_user_agent = request.META.get("HTTP_USER_AGENT", "")
    user.active_ip_address = get_client_ip(request)
    user.active_session_updated_at = timezone.now()
    user.save(update_fields=[
        "active_student_session_key",
        "active_device_name",
        "active_user_agent",
        "active_ip_address",
        "active_session_updated_at",
        "updated_at",
    ])

    refresh = RefreshToken.for_user(user)
    refresh["student_session"] = session_key

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role.name_roles if user.role else None,
            "is_active": user.is_active,
        },
}

class LoginSerializer(TokenObtainPairSerializer):
    # تغییر username_field به phone_or_email برای جلوگیری از خطای keyerror
    username_field = 'phone_or_email'
    
    # تعریف صریح فیلدها
    phone_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        phone_or_email = attrs.get('phone_or_email')
        password = attrs.get('password')
        
        # احراز هویت با استفاده از بک‌اند سفارشی
        user = authenticate(
            request=self.context.get('request'),
            username=phone_or_email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError('شماره موبایل/ایمیل یا رمز عبور اشتباه است')
        
        if not user.is_active:
            raise serializers.ValidationError('حساب کاربری غیرفعال است')
        
        # تولید توکن‌ها
        refresh = self.get_token(user)
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'phone': user.phone,
                'email': user.email,
                'role': user.role.name_roles if user.role else None,
                'is_active': user.is_active,
            }
        }
        return data


class StudentRegisterRequestOTPSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_phone(self, value):
        return validate_iran_mobile(value)

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("نام نمی‌تواند خالی باشد")
        return value

    def validate(self, attrs):
        user = User.objects.filter(phone=attrs["phone"]).select_related("role").first()
        if user and (user.is_active or user.phone_verified):
            raise serializers.ValidationError({"phone": "این شماره موبایل قبلا ثبت شده است"})

        if user and user.role and user.role.name_roles != Role.NameChoices.STUDENT:
            raise serializers.ValidationError({"phone": "این شماره موبایل قابل ثبت نام دانشجو نیست"})

        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        student_role = Role.objects.filter(name_roles=Role.NameChoices.STUDENT).first()
        if not student_role:
            raise serializers.ValidationError("نقش Student در دیتابیس تعریف نشده است")

        user = User.objects.filter(phone=self.validated_data["phone"]).first()
        if not user:
            user = User(phone=self.validated_data["phone"])

        user.role = student_role
        user.full_name = self.validated_data["full_name"]
        user.email = None
        user.password = make_password(self.validated_data["password"])
        user.is_active = False
        user.phone_verified = False
        user.save()

        code = set_user_otp(user, OTP_PURPOSE_REGISTER)
        sendSMS(user.phone, f"کد تایید ثبت نام شما: {code}")
        return user


class StudentRegisterVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField(min_length=4, max_length=10)
    device_name = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        return validate_iran_mobile(value)

    def validate(self, attrs):
        user = User.objects.filter(
            phone=attrs["phone"],
            role__name_roles=Role.NameChoices.STUDENT,
        ).first()
        if not user:
            raise serializers.ValidationError("کد تایید معتبر نیست")

        if user.is_active and user.phone_verified:
            raise serializers.ValidationError("این شماره موبایل قبلا ثبت شده است")

        validate_user_otp(user, attrs["code"], OTP_PURPOSE_REGISTER)
        attrs["user"] = user
        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        request = self.context["request"]
        user = self.validated_data["user"]
        user.is_active = True
        user.phone_verified = True
        user.save(update_fields=["is_active", "phone_verified", "updated_at"])
        clear_user_otp(user)
        return make_student_token_response(
            user,
            request,
            device_name=self.validated_data.get("device_name", ""),
        )


class StudentLoginRequestOTPSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_phone(self, value):
        return validate_iran_mobile(value)

    def validate(self, attrs):
        user = User.objects.filter(
            phone=attrs["phone"],
            role__name_roles=Role.NameChoices.STUDENT,
            is_active=True,
        ).first()

        if not user or not user.check_password(attrs["password"]):
            raise serializers.ValidationError("شماره موبایل یا رمز عبور اشتباه است")

        self.user = user
        return attrs

    def save(self, **kwargs):
        code = set_user_otp(self.user, OTP_PURPOSE_LOGIN)
        sendSMS(self.user.phone, f"کد ورود شما: {code}")
        return self.user


class StudentLoginVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField(min_length=4, max_length=10)
    device_name = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        return validate_iran_mobile(value)

    def validate(self, attrs):
        user = User.objects.filter(
            phone=attrs["phone"],
            role__name_roles=Role.NameChoices.STUDENT,
            is_active=True,
        ).first()
        if not user:
            raise serializers.ValidationError("دانشجویی با این شماره موبایل پیدا نشد")

        validate_user_otp(user, attrs["code"], OTP_PURPOSE_LOGIN)
        attrs["user"] = user
        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.phone_verified = True
        user.save(update_fields=["phone_verified", "updated_at"])
        clear_user_otp(user)
        return make_student_token_response(
            user,
            self.context["request"],
            device_name=self.validated_data.get("device_name", ""),
        )



class UserSerializer(serializers.ModelSerializer):
    """
    سریالایزر کاربر با نمایش نام نقش
    """
    role_name = serializers.CharField(source='role.name_roles', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone', 
            'role_name', 'is_active', 'last_login',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای ایجاد کاربر جدید (فقط ادمین)
    """
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True,
        help_text="رمز عبور (اختیاری، اگر خالی بماند کاربر نمی‌تواند وارد شود)"
    )
    
    class Meta:
        model = User
        fields = [
            'full_name', 'phone', 'email', 'password', 'role_id', 'is_active'
        ]
    
    def validate_phone(self, value):
        # اعتبارسنجی شماره موبایل ایران
        import re
        if not re.match(r'^09[0-9]{9}$', value):
            raise serializers.ValidationError('شماره موبایل باید با 09 شروع و 11 رقم باشد')
        
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('این شماره موبایل قبلاً ثبت شده است')
        return value
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('این ایمیل قبلاً ثبت شده است')
        return value
    
    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('نام کامل نمی‌تواند خالی باشد')
        return value.strip()
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای بروزرسانی کاربر
    """
    class Meta:
        model = User
        fields = ['full_name', 'email', 'is_active', 'role_id']
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError('این ایمیل قبلاً ثبت شده است')
        return value


class WriterCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone', 'password', 'is_active']
        read_only_fields = ['id']

    def validate_phone(self, value):
        phone = validate_iran_mobile(value)
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError('این شماره موبایل قبلا ثبت شده است')
        return phone

    def validate_full_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('نام نویسنده الزامی است')
        return value

    def create(self, validated_data):
        writer_role = Role.objects.filter(name_roles=Role.NameChoices.WRITER).first()
        if not writer_role:
            raise serializers.ValidationError('نقش Writer در دیتابیس تعریف نشده است')

        password = validated_data.pop('password')
        user = User.objects.create_user(
            role=writer_role,
            email=None,
            password=password,
            **validated_data,
        )
        return user


class WriterUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone', 'password', 'is_active']
        read_only_fields = ['id']

    def validate_phone(self, value):
        phone = validate_iran_mobile(value)
        if User.objects.filter(phone=phone).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError('این شماره موبایل قبلا ثبت شده است')
        return phone

    def validate_full_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('نام نویسنده الزامی است')
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    سریالایزر برای تغییر رمز عبور
    """
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        label="رمز عبور فعلی"
    )
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        label="رمز عبور جدید"
    )
    confirm_password = serializers.CharField(
        required=True, 
        write_only=True,
        label="تکرار رمز عبور جدید"
    )
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("رمز عبور فعلی اشتباه است")
        return value
    
    def validate(self, attrs):
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "رمز عبور جدید و تکرار آن مطابقت ندارند"
            })
        
        if len(new_password) < 8:
            raise serializers.ValidationError({
                "new_password": "رمز عبور باید حداقل 8 کاراکتر باشد"
            })
        
        # جلوگیری از انتخاب رمز عبور خیلی ساده
        common_passwords = ['12345678', 'password', '123456789', 'qwerty123']
        if new_password.lower() in common_passwords:
            raise serializers.ValidationError({
                "new_password": "رمز عبور بسیار ساده است، لطفاً رمز قوی‌تری انتخاب کنید"
            })
        
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class ResetPasswordSerializer(serializers.Serializer):
    """
    سریالایزر برای بازنشانی رمز عبور توسط ادمین
    """
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        label="رمز عبور جدید"
    )
    confirm_password = serializers.CharField(
        required=True, 
        write_only=True,
        label="تکرار رمز عبور جدید"
    )
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "رمز عبور جدید و تکرار آن مطابقت ندارند"
            })
        return attrs
    
    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

LogoutSerializer
