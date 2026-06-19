from rest_framework.permissions import BasePermission
from apps.accounts.models import Role


class IsAdminUser(BasePermission):
    """فقط کاربران با نقش Admin دسترسی دارند"""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.name_roles == Role.NameChoices.ADMIN
        )


class IsWriterUser(BasePermission):
    """Only users with the Writer role can access the writer dashboard APIs."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role
            and request.user.role.name_roles == Role.NameChoices.WRITER
        )


class HasActiveSubscription(BasePermission):
    message = "Active subscription is required to view questions."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.role and user.role.name_roles == Role.NameChoices.ADMIN:
            return True

        if not (
            user.role
            and user.role.name_roles == Role.NameChoices.STUDENT
        ):
            return False

        from django.utils import timezone
        from apps.subscription.models import UserSubscription

        now = timezone.now()
        return UserSubscription.objects.filter(
            user=user,
            is_active=True,
            start_date__lte=now,
            end_date__gt=now,
        ).exists()
