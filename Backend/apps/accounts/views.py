# accounts/views.py
from rest_framework import status, viewsets, mixins
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action

from .serializers import (
    LoginSerializer, UserSerializer, UserCreateSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, ResetPasswordSerializer
)
from .models import User
from ..questions.permissions import IsAdminUser


class LoginView(TokenObtainPairView):
    """
    ورود کاربر با شماره موبایل یا ایمیل
    
    POST /api/auth/login/
    {
        "phone_or_email": "09123456789",
        "password": "your_password"
    }
    
    Returns:
        {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token", 
            "user": {...}
        }
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer


class LogoutView(APIView):
    """
    خروج از سیستم و غیرفعال کردن توکن
    
    POST /api/auth/logout/
    {
        "refresh_token": "your_refresh_token"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': 'refresh_token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'با موفقیت خارج شدید'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    """
    دریافت اطلاعات کاربر جاری
    
    GET /api/auth/me/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    تغییر رمز عبور کاربر جاری
    
    POST /api/auth/change-password/
    {
        "old_password": "current_password",
        "new_password": "new_password",
        "confirm_password": "new_password"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'رمز عبور با موفقیت تغییر کرد'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserViewSet(mixins.CreateModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):
    """
    مدیریت کاربران (فقط ادمین)
    
    امکانات:
    - لیست کاربران (GET /api/users/)
    - مشاهده جزئیات (GET /api/users/{id}/)
    - ایجاد کاربر جدید (POST /api/users/)
    - بروزرسانی کاربر (PUT/PATCH /api/users/{id}/)
    - حذف کاربر (DELETE /api/users/{id}/)
    - بازنشانی رمز عبور (POST /api/users/{id}/reset-password/)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all().select_related('role').order_by('-created_at')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'phone', 'email']
    ordering_fields = ['created_at', 'full_name', 'phone']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'retrieve':
            return UserSerializer
        return UserSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # فیلتر بر اساس نقش
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role__name_roles=role)
        
        # فیلتر بر اساس وضعیت
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        
        # جلوگیری از حذف خود کاربر
        if user.id == request.user.id:
            return Response(
                {'error': 'نمی‌توانید خودتان را حذف کنید'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # بررسی وجود روابط (سوالات ایجاد شده و ...)
        if user.created_questions.exists():
            return Response(
                {'error': 'این کاربر دارای سوالات ایجاد شده است، ابتدا سوالات را حذف یا انتقال دهید'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        بازنشانی رمز عبور کاربر توسط ادمین
        
        POST /api/users/{id}/reset-password/
        {
            "new_password": "new_password",
            "confirm_password": "new_password"
        }
        """
        user = self.get_object()
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'message': f'رمز عبور کاربر {user.full_name} با موفقیت بازنشانی شد'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """
        آمار کاربران
        
        GET /api/users/stats/
        """
        total_users = User.objects.count()
        admin_count = User.objects.filter(role__name_roles='Admin').count()
        writer_count = User.objects.filter(role__name_roles='Writer').count()
        student_count = User.objects.filter(role__name_roles='Student').count()
        active_count = User.objects.filter(is_active=True).count()
        inactive_count = User.objects.filter(is_active=False).count()
        
        return Response({
            'total_users': total_users,
            'admin_count': admin_count,
            'writer_count': writer_count,
            'student_count': student_count,
            'active_count': active_count,
            'inactive_count': inactive_count,
        })


# برای راحتی کار، اکشن‌های اضافی برای ViewSet
from rest_framework.decorators import action