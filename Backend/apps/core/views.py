# apps/core/views.py
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Prefetch
from apps.accounts.models import User
from apps.core.models import EducationStage, Course, Year, ExamType
from apps.exam.models import Exam
from apps.questions.models import Question
from .serializers import (
    EducationStageSerializer, CourseSerializer,
    YearSerializer, ExamTypeSerializer, CategoryNodeSerializer
)
from apps.questions.permissions import IsAdminUser


class PublicSiteStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "active_users": User.objects.filter(is_active=True).count(),
            "held_exams": Exam.objects.count(),
            "total_questions": Question.objects.count(),
        })


class EducationStageViewSet(mixins.CreateModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    """
    ViewSet برای مدیریت مقاطع تحصیلی
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = EducationStageSerializer
    queryset = EducationStage.objects.all().order_by('id')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.courses.exists():
            return Response(
                {'error': 'این مقطع دارای دوره‌های مرتبط است. ابتدا دوره‌ها را حذف کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class CourseViewSet(mixins.CreateModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    """
    ViewSet برای مدیریت دوره‌ها
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CourseSerializer
    queryset = Course.objects.all().select_related('stage').order_by('stage_id', 'name_course')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.years.exists():
            return Response(
                {'error': 'این دوره دارای سال‌های تحصیلی مرتبط است. ابتدا سال‌ها را حذف کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class YearViewSet(mixins.CreateModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):
    """
    ViewSet برای مدیریت سال‌های تحصیلی
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = YearSerializer
    queryset = Year.objects.all().select_related('course').order_by('course_id', 'years_number')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.exam_types.exists():
            return Response(
                {'error': 'این سال دارای انواع آزمون مرتبط است. ابتدا آنها را حذف کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class ExamTypeViewSet(mixins.CreateModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):
    """
    ViewSet برای مدیریت انواع آزمون
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ExamTypeSerializer
    queryset = ExamType.objects.all().select_related('year__course__stage').order_by('year_id', 'name_exam_types')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.questions.exists():
            return Response(
                {'error': 'این نوع آزمون دارای سوالات مرتبط است. ابتدا سوالات را حذف کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class CategoryTreeView(APIView):
    """
    نمایش درخت کامل دسته‌بندی (مقطع -> دوره -> سال -> نوع آزمون)
    
    GET /api/core/category-tree/
    
    Returns:
        [
            {
                "id": 1,
                "name": "پزشکی",
                "type": "stage",
                "children": [
                    {
                        "id": 1,
                        "name": "فیزیولوژی",
                        "type": "course",
                        "children": [
                            {
                                "id": 1,
                                "name": "سال 4",
                                "type": "year",
                                "children": [
                                    {
                                        "id": 1,
                                        "name": "میان‌ترم",
                                        "type": "exam_type",
                                        "question_count": 15
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        tree = []
        exam_types_queryset = ExamType.objects.annotate(
            questions_count=Count('questions')
        ).order_by('name_exam_types')
        years_queryset = Year.objects.prefetch_related(
            Prefetch('exam_types', queryset=exam_types_queryset)
        ).order_by('years_number')
        courses_queryset = Course.objects.prefetch_related(
            Prefetch('years', queryset=years_queryset)
        ).order_by('name_course')
        stages = EducationStage.objects.prefetch_related(
            Prefetch('courses', queryset=courses_queryset)
        ).order_by('id')
        
        for stage in stages:
            stage_node = {
                'id': stage.id,
                'name': stage.name_education_stage,
                'type': 'stage',
                'children': []
            }
            
            for course in stage.courses.all():
                course_node = {
                    'id': course.id,
                    'name': course.name_course,
                    'type': 'course',
                    'children': [],
                    'metadata': {
                        'stage_id': stage.id,
                        'stage_name': stage.name_education_stage
                    }
                }
                
                for year in course.years.all():
                    year_node = {
                        'id': year.id,
                        'name': f"سال {year.years_number}",
                        'type': 'year',
                        'children': [],
                        'metadata': {
                            'course_id': course.id,
                            'course_name': course.name_course,
                            'stage_id': stage.id,
                            'stage_name': stage.name_education_stage,
                            'year_number': year.years_number
                        }
                    }
                    
                    for exam_type in year.exam_types.all():
                        exam_node = {
                            'id': exam_type.id,
                            'name': exam_type.get_name_exam_types_display(),
                            'type': 'exam_type',
                            'question_count': exam_type.questions_count,
                            'metadata': {
                                'name_exam_types': exam_type.name_exam_types,
                                'year_id': year.id,
                                'course_id': course.id,
                                'stage_id': stage.id,
                                'year_number': year.years_number,
                                'course_name': course.name_course,
                                'stage_name': stage.name_education_stage
                            }
                        }
                        year_node['children'].append(exam_node)
                    
                    course_node['children'].append(year_node)
                
                stage_node['children'].append(course_node)
            
            tree.append(stage_node)
        
        # سریالایز کردن درخت (اختیاری است، چون قبلاً دیکشنری ساخته شده)
        # می‌توانید از CategoryNodeSerializer استفاده کنید اما دیکشنری آماده است
        return Response(tree)


class CategoryBreadcrumbView(APIView):
    """
    نمایش مسیر (breadcrumb) برای یک دسته‌بندی خاص
    
    GET /api/core/category-breadcrumb/?exam_type_id=1
    یا
    GET /api/core/category-breadcrumb/?year_id=1
    یا
    GET /api/core/category-breadcrumb/?course_id=1
    یا
    GET /api/core/category-breadcrumb/?stage_id=1
    
    Returns:
        [
            {"id": 1, "name": "پزشکی", "type": "stage"},
            {"id": 2, "name": "فیزیولوژی", "type": "course"},
            {"id": 3, "name": "سال 4", "type": "year"},
            {"id": 4, "name": "میان‌ترم", "type": "exam_type"}
        ]
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        exam_type_id = request.query_params.get('exam_type_id')
        year_id = request.query_params.get('year_id')
        course_id = request.query_params.get('course_id')
        stage_id = request.query_params.get('stage_id')
        
        breadcrumb = []
        
        if exam_type_id:
            try:
                exam_type = ExamType.objects.select_related('year__course__stage').get(id=exam_type_id)
                breadcrumb = [
                    {'id': exam_type.year.course.stage.id, 'name': exam_type.year.course.stage.name_education_stage, 'type': 'stage'},
                    {'id': exam_type.year.course.id, 'name': exam_type.year.course.name_course, 'type': 'course'},
                    {'id': exam_type.year.id, 'name': f"سال {exam_type.year.years_number}", 'type': 'year'},
                    {'id': exam_type.id, 'name': exam_type.get_name_exam_types_display(), 'type': 'exam_type'},
                ]
            except ExamType.DoesNotExist:
                return Response({'error': 'Exam type not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif year_id:
            try:
                year = Year.objects.select_related('course__stage').get(id=year_id)
                breadcrumb = [
                    {'id': year.course.stage.id, 'name': year.course.stage.name_education_stage, 'type': 'stage'},
                    {'id': year.course.id, 'name': year.course.name_course, 'type': 'course'},
                    {'id': year.id, 'name': f"سال {year.years_number}", 'type': 'year'},
                ]
            except Year.DoesNotExist:
                return Response({'error': 'Year not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif course_id:
            try:
                course = Course.objects.select_related('stage').get(id=course_id)
                breadcrumb = [
                    {'id': course.stage.id, 'name': course.stage.name_education_stage, 'type': 'stage'},
                    {'id': course.id, 'name': course.name_course, 'type': 'course'},
                ]
            except Course.DoesNotExist:
                return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif stage_id:
            try:
                stage = EducationStage.objects.get(id=stage_id)
                breadcrumb = [
                    {'id': stage.id, 'name': stage.name_education_stage, 'type': 'stage'},
                ]
            except EducationStage.DoesNotExist:
                return Response({'error': 'Stage not found'}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response({'error': 'Please provide exam_type_id, year_id, course_id, or stage_id'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        return Response(breadcrumb)
