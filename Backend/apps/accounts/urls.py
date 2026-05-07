# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LogoutView, MeView, ChangePasswordView, UserViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    # مسیرهای احراز هویت
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    
    # مسیرهای مدیریت کاربران
    path('', include(router.urls)),
]