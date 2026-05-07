# accounts/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()


# class LoginSerializer(TokenObtainPairSerializer):
#     """
#     سریالایزر ورود با پشتیبانی از شماره موبایل (primary) و ایمیل (secondary)
#     """
    
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         # تغییر نام فیلد برای وضوح بیشتر
#         self.fields['phone_or_email'] = self.fields.pop('username')
#         self.fields['phone_or_email'].label = 'Phone Number or Email'
    
#     def validate(self, attrs):
#         # دریافت شناسه (شماره موبایل یا ایمیل)
#         phone_or_email = attrs.get('phone_or_email', '')
#         password = attrs.get('password', '')
        
#         # تعیین نوع ورودی
#         if '@' in phone_or_email:
#             # ورود با ایمیل
#             authenticate_kwargs = {'email': phone_or_email, 'password': password}
#         else:
#             # ورود با شماره موبایل
#             authenticate_kwargs = {'phone': phone_or_email, 'password': password}
        
#         # احراز هویت کاربر
#         user = authenticate(
#             request=self.context.get('request'),
#             **authenticate_kwargs
#         )
        
#         if not user:
#             raise serializers.ValidationError('شماره موبایل/ایمیل یا رمز عبور اشتباه است')
        
#         if not user.is_active:
#             raise serializers.ValidationError('حساب کاربری غیرفعال است')
        
#         # بررسی دسترسی ادمین برای فاز اول
#         if not (user.role and user.role.name_roles == 'Admin'):
#             raise serializers.ValidationError('دسترسی ادمین مورد نیاز است')
        
#         # ذخیره کاربر در context
#         self.user = user
        
#         # تولید توکن‌ها
#         data = super().validate(attrs)
        
#         # اضافه کردن اطلاعات کاربر به پاسخ
#         data['user'] = {
#             'id': user.id,
#             'full_name': user.full_name,
#             'phone': user.phone,
#             'email': user.email,
#             'role': user.role.name_roles if user.role else None,
#             'is_active': user.is_active,
#         }
        
#         return data


from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

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
        
        if not (user.role and user.role.name_roles == 'Admin'):
            raise serializers.ValidationError('دسترسی ادمین مورد نیاز است')
        
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
