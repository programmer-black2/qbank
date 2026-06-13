from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SubscriptionPlanViewSet, UserSubscriptionViewSet


router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register(
    "user-subscriptions",
    UserSubscriptionViewSet,
    basename="user-subscription",
)

urlpatterns = [
    path("", include(router.urls)),
]
