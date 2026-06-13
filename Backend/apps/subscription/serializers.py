from decimal import Decimal
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import User

from .models import SubscriptionPlan, UserSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    subscriptions_count = serializers.IntegerField(read_only=True)
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "title",
            "duration_days",
            "price",
            "discount_percent",
            "final_price",
            "is_active",
            "subscriptions_count",
            "created_at",
        ]
        read_only_fields = ["id", "subscriptions_count", "created_at", "final_price"]

    def get_final_price(self, obj):
        discount_multiplier = (Decimal("100") - obj.discount_percent) / Decimal("100")
        return (obj.price * discount_multiplier).quantize(Decimal("0.01"))

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("عنوان پلن نمی‌تواند خالی باشد.")
        return value

    def validate_duration_days(self, value):
        if value <= 0:
            raise serializers.ValidationError("مدت اشتراک باید بیشتر از صفر روز باشد.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("قیمت نمی‌تواند منفی باشد.")
        return value

    def validate_discount_percent(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.")
        return value


class UserSubscriptionSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
    )
    subscription_plan_id = serializers.PrimaryKeyRelatedField(
        source="subscription_plan",
        queryset=SubscriptionPlan.objects.all(),
    )
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    plan_title = serializers.CharField(source="subscription_plan.title", read_only=True)
    plan_duration_days = serializers.IntegerField(
        source="subscription_plan.duration_days",
        read_only=True,
    )
    remaining_days = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            "id",
            "user_id",
            "user_full_name",
            "user_phone",
            "user_email",
            "subscription_plan_id",
            "plan_title",
            "plan_duration_days",
            "start_date",
            "end_date",
            "remaining_days",
            "status",
            "is_active",
        ]
        read_only_fields = [
            "id",
            "user_full_name",
            "user_phone",
            "user_email",
            "plan_title",
            "plan_duration_days",
            "remaining_days",
            "status",
        ]
        extra_kwargs = {
            "start_date": {"required": False},
            "end_date": {"required": False},
        }

    def get_remaining_days(self, obj):
        if not obj.is_active:
            return 0

        delta = obj.end_date - timezone.now()
        if delta.total_seconds() <= 0:
            return 0

        return delta.days + (1 if delta.seconds else 0)

    def get_status(self, obj):
        if not obj.is_active:
            return "inactive"
        if obj.end_date <= timezone.now():
            return "expired"
        return "active"

    def validate(self, attrs):
        instance = self.instance
        plan = attrs.get(
            "subscription_plan",
            getattr(instance, "subscription_plan", None),
        )
        start_date = attrs.get("start_date", getattr(instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(instance, "end_date", None))
        request_data = getattr(self, "initial_data", {})
        should_recalculate_end_date = (
            "end_date" not in request_data
            and (
                instance is None
                or "subscription_plan_id" in request_data
                or "start_date" in request_data
            )
        )

        if start_date is None:
            start_date = timezone.now()
            attrs["start_date"] = start_date

        if (end_date is None or should_recalculate_end_date) and plan:
            end_date = start_date + timedelta(days=plan.duration_days)
            attrs["end_date"] = end_date

        if end_date and end_date <= start_date:
            raise serializers.ValidationError({
                "end_date": "تاریخ پایان باید بعد از تاریخ شروع باشد."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        subscription = UserSubscription.objects.create(**validated_data)
        self._deactivate_other_active_subscriptions(subscription)
        return subscription

    @transaction.atomic
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        self._deactivate_other_active_subscriptions(instance)
        return instance

    def _deactivate_other_active_subscriptions(self, subscription):
        if not subscription.is_active:
            return

        UserSubscription.objects.filter(
            user=subscription.user,
            is_active=True,
        ).exclude(id=subscription.id).update(is_active=False)
