from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class Role(models.Model):
    class NameChoices(models.TextChoices):
        ADMIN = "Admin", "Admin"
        WRITER = "Writer", "Writer"
        STUDENT = "Student", "Student"

    id = models.PositiveSmallIntegerField(primary_key=True)
    name_roles = models.CharField(max_length=20, unique=True, choices=NameChoices.choices)

    class Meta:
        db_table = "roles"
        managed = False

    def __str__(self):
        return self.name_roles


class UserManager(BaseUserManager):
    def create_user(self, phone, email=None, password=None, **extra_fields):
        """
        ایجاد کاربر عادی با شماره موبایل اجباری
        """
        if not phone:
            raise ValueError("Phone number is required")
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(
            phone=phone,
            email=email,
            **extra_fields
        )
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone, email=None, password=None, **extra_fields):
        """
        ایجاد ادمین با شماره موبایل
        """
        admin_role = Role.objects.filter(name_roles=Role.NameChoices.ADMIN).first()
        if admin_role:
            extra_fields["role"] = admin_role
        
        extra_fields.setdefault("is_active", True)
        
        # اطمینان از اینکه ادمین role دارد
        if "role" not in extra_fields or not extra_fields["role"]:
            raise ValueError("Admin user must have an admin role")
        
        return self.create_user(
            phone=phone,
            email=email,
            password=password,
            **extra_fields
        )


class User(AbstractBaseUser):
    id = models.PositiveIntegerField(primary_key=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.DO_NOTHING,
        db_column="role_id",
        related_name="users",
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    password = models.CharField(max_length=255, db_column="password_hash")
    phone = models.CharField(max_length=20, unique=True)  # این به عنوان username استفاده می‌شود
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    phone_verified = models.BooleanField(default=False)
    otp_purpose = models.CharField(max_length=20, null=True, blank=True)
    otp_code_hash = models.CharField(max_length=64, null=True, blank=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.PositiveSmallIntegerField(default=0)
    active_student_session_key = models.CharField(max_length=36, null=True, blank=True, unique=True)
    active_device_name = models.CharField(max_length=120, null=True, blank=True)
    active_user_agent = models.TextField(null=True, blank=True)
    active_ip_address = models.CharField(max_length=45, null=True, blank=True)
    active_session_updated_at = models.DateTimeField(null=True, blank=True)
    
    # فیلدهای جدید برای احراز هویت دو مرحله‌ای (برای آینده)
    # phone_verified = models.BooleanField(default=False)
    # email_verified = models.BooleanField(default=False)
    
    objects = UserManager()
    
    # ✅ تغییر: phone به عنوان USERNAME_FIELD
    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["full_name"]  # فیلدهای اجباری هنگام createsuperuser
    # توجه: email اختیاری است چون nullable=True دارد
    
    class Meta:
        db_table = "users"
        managed = False
    
    def __str__(self):
        return self.phone
    
    @property
    def is_staff(self):
        return bool(self.role and self.role.name_roles == Role.NameChoices.ADMIN)
    
    @property
    def is_superuser(self):
        return bool(self.role and self.role.name_roles == Role.NameChoices.ADMIN)
    
    def get_full_name(self):
        return self.full_name
    
    def get_short_name(self):
        return self.full_name


class SubscriptionPlan(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True)
    title = models.CharField(max_length=100)
    duration_days = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=20, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subscription_plans"
        managed = False

    def __str__(self):
        return self.title


class UserSubscription(models.Model):
    id = models.PositiveBigIntegerField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="user_id",
        related_name="subscriptions",
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.DO_NOTHING,
        db_column="subscription_plan_id",
        related_name="user_subscriptions",
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "user_subscriptions"
        managed = False

    def __str__(self):
        return f"Subscription #{self.id} - User {self.user_id}"
