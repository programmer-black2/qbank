from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    StudentSubscriptionViewSet,
    SubscriptionPlanViewSet,
    UserSubscriptionViewSet,
)


router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register(
    "user-subscriptions",
    UserSubscriptionViewSet,
    basename="user-subscription",
)
router.register(
    "student",
    StudentSubscriptionViewSet,
    basename="student-subscription",
)

urlpatterns = [
    path("", include(router.urls)),
]
