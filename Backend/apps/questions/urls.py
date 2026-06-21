# apps/questions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthorQuestionViewSet,
    CategoryViewSet,
    PublicQuestionViewSet,
    QuestionReportViewSet,
    QuestionViewSet,
    StudentQuestionViewSet,
)

router = DefaultRouter()
router.register('questions', QuestionViewSet, basename='question')
router.register('categories', CategoryViewSet, basename='category')
router.register('student/questions', StudentQuestionViewSet, basename='student-question')
router.register('public/questions', PublicQuestionViewSet, basename='public-question')
router.register('author/questions', AuthorQuestionViewSet, basename='author-question')
router.register('reports', QuestionReportViewSet, basename='question-report')

urlpatterns = [
    path('', include(router.urls)),
]
