from django.db import models

from apps.accounts.models import User


class SubscriptionPlan(models.Model):
    id = models.SmallAutoField(primary_key=True)
    title = models.CharField(max_length=100)
    duration_days = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=20, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subscription_plans"
        managed = False
        ordering = ["-created_at", "-id"]
        verbose_name = "پلن اشتراک"
        verbose_name_plural = "مدیریت پلن‌های اشتراک"

    def __str__(self):
        return self.title

    @property
    def user_subscription_count(self):
        return self.subscriptions.count()


class UserSubscription(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="user_id",
        related_name="subscription_app_subscriptions",
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.DO_NOTHING,
        db_column="subscription_plan_id",
        related_name="subscriptions",
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "user_subscriptions"
        managed = False
        ordering = ["-start_date", "-id"]
        verbose_name = "اشتراک کاربر"
        verbose_name_plural = "مدیریت اشتراک کاربران"

    def __str__(self):
        return f"Subscription #{self.id} - User {self.user_id}"

    @property
    def has_expired(self):
        from django.utils import timezone

        return self.end_date <= timezone.now()
