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
