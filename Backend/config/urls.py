# """
# URL configuration for config project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/5.2/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
# from django.contrib import admin
# from django.urls import path , include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework_simplejwt.views import TokenRefreshView
# from apps.accounts.views import LoginView, LogoutView, MeView

# urlpatterns = [
#     path('admin/', admin.site.urls),
    
#     # مسیرهای API
#     path('api/auth/login/', LoginView.as_view(), name='login'),
#     path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/auth/logout/', LogoutView.as_view(), name='logout'),
#     path('api/auth/me/', MeView.as_view(), name='me'),
    
#     # مسیرهای اپ‌ها
#     path('api/accounts/', include('apps.accounts.urls')),
#     path('api/core/', include('apps.core.urls')),
#     path('api/questions/', include('apps.questions.urls')),
#     path('api/exam/', include('apps.exam.urls')),
# ]

# # سرویس فایل‌های استاتیک و مدیا
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API routes
    path('api/', include('apps.accounts.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/questions/', include('apps.questions.urls')),
    path('api/exam/', include('apps.exam.urls')),
    path('api/subscription/', include('apps.subscription.urls')),
]

# سرویس فایل‌های استاتیک و مدیا در حالت توسعه
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
