# accounts/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


def normalize_phone(value):
    digit_map = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    return str(value or "").strip().translate(digit_map)

class PhoneOrEmailBackend(ModelBackend):
    """
    بک‌اند احراز هویت که اجازه ورود با شماره موبایل یا ایمیل را می‌دهد
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            # برای لاگین با phone_or_email
            phone_or_email = kwargs.get('phone_or_email') or kwargs.get('phone') or kwargs.get('email')
            if phone_or_email:
                username = phone_or_email
            else:
                return None
        
        username = str(username or "").strip()
        normalized_username = normalize_phone(username)

        # جستجو بر اساس شماره موبایل یا ایمیل
        try:
            user = User.objects.get(Q(phone=normalized_username) | Q(email=username))
        except User.DoesNotExist:
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
