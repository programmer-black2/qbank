
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamQuestionViewSet

router = DefaultRouter()
router.register('exams', ExamViewSet, basename='exam')
router.register('exam-questions', ExamQuestionViewSet, basename='exam-question')

urlpatterns = [
    path('', include(router.urls)),
]