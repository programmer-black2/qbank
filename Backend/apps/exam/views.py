from django.shortcuts import render

# apps/exam/views.py (ساده شده برای فاز اول)
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Exam, ExamQuestion
from .serializers import ExamSerializer, ExamDetailSerializer, ExamCreateUpdateSerializer, ExamQuestionSerializer
from apps.questions.permissions import IsAdminUser


class ExamViewSet(viewsets.ModelViewSet):
    """
    مدیریت آزمون‌ها (فقط ادمین)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time', 'duration_minutes']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Exam.objects.all().prefetch_related('exam_questions__question')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ExamCreateUpdateSerializer
        return ExamSerializer
    
    @action(detail=True, methods=['post'], url_path='add-question')
    def add_question(self, request, pk=None):
        exam = self.get_object()
        question_id = request.data.get('question_id')
        
        if not question_id:
            return Response({'error': 'question_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if ExamQuestion.objects.filter(exam=exam, question_id=question_id).exists():
            return Response({'error': 'این سوال قبلاً اضافه شده است'}, status=status.HTTP_400_BAD_REQUEST)
        
        exam_question = ExamQuestion.objects.create(exam=exam, question_id=question_id)
        serializer = ExamQuestionSerializer(exam_question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='remove-question')
    def remove_question(self, request, pk=None):
        exam = self.get_object()
        question_id = request.query_params.get('question_id')
        
        if not question_id:
            return Response({'error': 'question_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted, _ = ExamQuestion.objects.filter(exam=exam, question_id=question_id).delete()
        if deleted:
            return Response({'message': 'حذف شد'}, status=status.HTTP_200_OK)
        return Response({'error': 'سوال یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class ExamQuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ExamQuestionSerializer
    queryset = ExamQuestion.objects.all().select_related('exam', 'question')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['exam_id', 'question_id']


# حذف کلاس‌های مربوط به دانشجو (StudentExamAttemptViewSet, StudentExamStartView, StudentExamSubmitView)