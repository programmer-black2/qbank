# apps/questions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, CategoryViewSet

router = DefaultRouter()
router.register('questions', QuestionViewSet, basename='question')
router.register('categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]