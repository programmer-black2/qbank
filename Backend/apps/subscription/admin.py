from datetime import timedelta

from django import forms
from django.contrib import admin, messages
from django.utils import timezone

from .models import SubscriptionPlan, UserSubscription


class UserSubscriptionAdminForm(forms.ModelForm):
    start_date = forms.DateTimeField(required=False)
    end_date = forms.DateTimeField(required=False)

    class Meta:
        model = UserSubscription
        fields = "__all__"


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "duration_days",
        "price",
        "discount_percent",
        "is_active",
        "subscriptions_count",
        "created_at",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("title",)
    ordering = ("-created_at", "-id")
    readonly_fields = ("created_at", "subscriptions_count")

    def subscriptions_count(self, obj):
        return obj.subscriptions.count()

    subscriptions_count.short_description = "تعداد خریدها"

    def delete_model(self, request, obj):
        if obj.subscriptions.exists():
            obj.is_active = False
            obj.save(update_fields=["is_active"])
            self.message_user(
                request,
                "این پلن قبلاً خریداری شده است؛ به جای حذف فیزیکی غیرفعال شد.",
                level=messages.WARNING,
            )
            return

        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        used_plan_ids = []

        for plan in queryset:
            if plan.subscriptions.exists():
                plan.is_active = False
                plan.save(update_fields=["is_active"])
                used_plan_ids.append(str(plan.id))
            else:
                plan.delete()

        if used_plan_ids:
            self.message_user(
                request,
                f"پلن‌های استفاده‌شده حذف فیزیکی نشدند و فقط غیرفعال شدند: {', '.join(used_plan_ids)}",
                level=messages.WARNING,
            )


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    form = UserSubscriptionAdminForm
    list_display = (
        "id",
        "user_full_name",
        "user_phone",
        "subscription_plan",
        "start_date",
        "end_date",
        "remaining_days",
        "status",
        "is_active",
    )
    list_filter = ("is_active", "subscription_plan", "start_date", "end_date")
    search_fields = (
        "user__full_name",
        "user__phone",
        "user__email",
        "subscription_plan__title",
    )
    ordering = ("-start_date", "-id")
    raw_id_fields = ("user", "subscription_plan")
    readonly_fields = ("status", "remaining_days")
    actions = ("deactivate_subscriptions",)

    def user_full_name(self, obj):
        return obj.user.full_name

    user_full_name.short_description = "کاربر"

    def user_phone(self, obj):
        return obj.user.phone

    user_phone.short_description = "شماره موبایل"

    def remaining_days(self, obj):
        if not obj.is_active:
            return 0

        delta = obj.end_date - timezone.now()
        if delta.total_seconds() <= 0:
            return 0

        return delta.days + (1 if delta.seconds else 0)

    remaining_days.short_description = "روزهای باقی‌مانده"

    def status(self, obj):
        if not obj.is_active:
            return "غیرفعال"
        if obj.end_date <= timezone.now():
            return "منقضی‌شده"
        return "فعال"

    status.short_description = "وضعیت"

    def save_model(self, request, obj, form, change):
        if not obj.start_date:
            obj.start_date = timezone.now()

        should_calculate_end_date = (
            not obj.end_date
            or (
                "end_date" not in form.changed_data
                and (
                    "subscription_plan" in form.changed_data
                    or "start_date" in form.changed_data
                )
            )
        )
        if should_calculate_end_date and obj.subscription_plan:
            obj.end_date = obj.start_date + timedelta(
                days=obj.subscription_plan.duration_days
            )

        super().save_model(request, obj, form, change)

        if obj.is_active:
            UserSubscription.objects.filter(
                user=obj.user,
                is_active=True,
            ).exclude(id=obj.id).update(is_active=False)

    def deactivate_subscriptions(self, request, queryset):
        updated_count = queryset.update(is_active=False)
        self.message_user(
            request,
            f"{updated_count} اشتراک کاربر غیرفعال شد.",
            level=messages.SUCCESS,
        )

    deactivate_subscriptions.short_description = "غیرفعال کردن اشتراک‌های انتخاب‌شده"
