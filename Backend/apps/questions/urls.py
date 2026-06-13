# apps/questions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, CategoryViewSet, StudentQuestionViewSet

router = DefaultRouter()
router.register('questions', QuestionViewSet, basename='question')
router.register('categories', CategoryViewSet, basename='category')
router.register('student/questions', StudentQuestionViewSet, basename='student-question')

urlpatterns = [
    path('', include(router.urls)),
]
