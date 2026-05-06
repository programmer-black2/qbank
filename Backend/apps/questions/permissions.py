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