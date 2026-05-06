# # apps/exam/urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ExamViewSet, ExamQuestionViewSet, StudentExamAttemptViewSet

# router = DefaultRouter()
# router.register('exams', ExamViewSet, basename='exam')
# router.register('exam-questions', ExamQuestionViewSet, basename='exam-question')
# router.register('attempts', StudentExamAttemptViewSet, basename='attempt')

# urlpatterns = [
#     path('', include(router.urls)),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamQuestionViewSet

router = DefaultRouter()
router.register('exams', ExamViewSet, basename='exam')
router.register('exam-questions', ExamQuestionViewSet, basename='exam-question')

urlpatterns = [
    path('', include(router.urls)),
]