from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.questions.permissions import IsAdminUser

from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = SubscriptionPlanSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title"]
    ordering_fields = [
        "created_at",
        "duration_days",
        "price",
        "discount_percent",
        "is_active",
    ]
    ordering = ["-created_at", "-id"]

    def get_queryset(self):
        queryset = SubscriptionPlan.objects.annotate(
            subscriptions_count=Count("subscriptions")
        )

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        return queryset

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()

        if plan.subscriptions.exists():
            plan.is_active = False
            plan.save(update_fields=["is_active"])
            serializer = self.get_serializer(plan)
            return Response(
                {
                    "message": "این پلن قبلاً خریداری شده است؛ به جای حذف فیزیکی غیرفعال شد.",
                    "plan": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSubscriptionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "user__full_name",
        "user__phone",
        "user__email",
        "subscription_plan__title",
    ]
    ordering_fields = [
        "start_date",
        "end_date",
        "is_active",
        "subscription_plan__duration_days",
    ]
    ordering = ["-start_date", "-id"]

    def get_queryset(self):
        queryset = UserSubscription.objects.select_related(
            "user",
            "subscription_plan",
        )

        status_value = self.request.query_params.get("status")
        if status_value == "active":
            queryset = queryset.filter(is_active=True, end_date__gt=timezone.now())
        elif status_value == "expired":
            queryset = queryset.filter(end_date__lte=timezone.now())
        elif status_value == "inactive":
            queryset = queryset.filter(is_active=False)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        plan_id = self.request.query_params.get("subscription_plan_id")
        if plan_id:
            queryset = queryset.filter(subscription_plan_id=plan_id)

        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        has_subscription = self.request.query_params.get("has_subscription")
        if has_subscription is not None and has_subscription.lower() == "true":
            queryset = queryset.filter(
                Q(is_active=True) | Q(end_date__gt=timezone.now())
            )

        return queryset

    @action(detail=False, methods=["get"], url_path="expired")
    def expired(self, request):
        queryset = self.filter_queryset(
            UserSubscription.objects.select_related(
                "user",
                "subscription_plan",
            ).filter(end_date__lte=timezone.now())
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request, pk=None):
        subscription = self.get_object()
        subscription.is_active = False
        subscription.save(update_fields=["is_active"])
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        subscription = self.get_object()
        data = request.data.copy()

        data.setdefault("user_id", subscription.user_id)
        data.setdefault(
            "subscription_plan_id",
            subscription.subscription_plan_id,
        )
        data.setdefault("start_date", timezone.now())
        data["is_active"] = True

        serializer = self.get_serializer(
            subscription,
            data=data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        now = timezone.now()
        return Response({
            "total": UserSubscription.objects.count(),
            "active": UserSubscription.objects.filter(
                is_active=True,
                end_date__gt=now,
            ).count(),
            "expired": UserSubscription.objects.filter(end_date__lte=now).count(),
            "inactive": UserSubscription.objects.filter(is_active=False).count(),
        })
