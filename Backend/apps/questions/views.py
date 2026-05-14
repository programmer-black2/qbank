# from django.shortcuts import render

# from rest_framework import viewsets, status, filters
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.pagination import PageNumberPagination
# from django_filters.rest_framework import DjangoFilterBackend
# from django.db.models import Q
# from apps.questions.models import Question
# from apps.core.models import EducationStage, Course, Year, ExamType
# from .serializers import (
#     QuestionListSerializer, QuestionDetailSerializer,
#     QuestionCreateUpdateSerializer, EducationStageSerializer,
#     CourseSerializer, YearSerializer, ExamTypeSerializer
# )
# from .permissions import IsAdminUser
# from .filters import QuestionFilter


# class StandardPagination(PageNumberPagination):
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100


# class QuestionViewSet(viewsets.ModelViewSet):
#     """ViewSet برای مدیریت سوالات"""
#     queryset = Question.objects.all().order_by('-created_at')
#     pagination_class = StandardPagination
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_class = QuestionFilter
#     search_fields = ['question_text', 'id']
#     ordering_fields = ['created_at', 'difficulty', 'exam_type__year__years_number']
#     ordering = ['-created_at']
    
#     def get_permissions(self):
#         """فقط ادمین به همه عملیات دسترسی دارد"""
#         return [IsAuthenticated(), IsAdminUser()]
    
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return QuestionListSerializer
#         elif self.action in ['create', 'update', 'partial_update']:
#             return QuestionCreateUpdateSerializer
#         return QuestionDetailSerializer
    
#     def perform_create(self, serializer):
#         serializer.save(created_by=self.request.user)
    
#     @action(detail=False, methods=['get'], url_path='category-tree')
#     def category_tree(self, request):
#         """درخت دسته‌بندی کامل را برمی‌گرداند"""
#         tree = []
#         stages = EducationStage.objects.all()
        
#         for stage in stages:
#             stage_node = {
#                 'id': stage.id,
#                 'name': stage.name_education_stage,
#                 'type': 'stage',
#                 'children': []
#             }
            
#             courses = Course.objects.filter(stage=stage)
#             for course in courses:
#                 course_node = {
#                     'id': course.id,
#                     'name': course.name_course,
#                     'type': 'course',
#                     'children': []
#                 }
                
#                 years = Year.objects.filter(course=course)
#                 for year in years:
#                     year_node = {
#                         'id': year.id,
#                         'name': f"سال {year.years_number}",
#                         'type': 'year',
#                         'children': []
#                     }
                    
#                     exam_types = ExamType.objects.filter(year=year)
#                     for exam_type in exam_types:
#                         exam_node = {
#                             'id': exam_type.id,
#                             'name': exam_type.get_name_exam_types_display(),
#                             'type': 'exam_type',
#                             'question_count': exam_type.questions.count()
#                         }
#                         year_node['children'].append(exam_node)
                    
#                     if year_node['children']:
#                         course_node['children'].append(year_node)
                
#                 if course_node['children']:
#                     stage_node['children'].append(course_node)
            
#             if stage_node['children']:
#                 tree.append(stage_node)
        
#         return Response(tree)
    
#     @action(detail=False, methods=['get'], url_path='statistics')
#     def statistics(self, request):
#         """آمار سوالات برای داشبورد"""
#         total_questions = Question.objects.count()
#         mcq_count = Question.objects.filter(question_type='mcq').count()
#         descriptive_count = Question.objects.filter(question_type='descriptive').count()
        
#         difficulty_stats = {
#             'easy': Question.objects.filter(difficulty='easy').count(),
#             'medium': Question.objects.filter(difficulty='medium').count(),
#             'hard': Question.objects.filter(difficulty='hard').count(),
#             'unknown': Question.objects.filter(difficulty='unknown').count(),
#         }
        
#         # سوالات امروز
#         from django.utils import timezone
#         today = timezone.now().date()
#         today_questions = Question.objects.filter(created_at__date=today).count()
        
#         return Response({
#             'total_questions': total_questions,
#             'mcq_count': mcq_count,
#             'descriptive_count': descriptive_count,
#             'difficulty_stats': difficulty_stats,
#             'today_questions': today_questions
#         })


# class CategoryViewSet(viewsets.GenericViewSet):
#     """ViewSet برای مدیریت دسته‌بندی‌ها"""
#     permission_classes = [IsAuthenticated, IsAdminUser]
    
#     @action(detail=False, methods=['get'], url_path='stages')
#     def get_stages(self, request):
#         serializer = EducationStageSerializer(EducationStage.objects.all(), many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'], url_path='courses')
#     def get_courses(self, request):
#         stage_id = request.query_params.get('stage_id')
#         queryset = Course.objects.all()
#         if stage_id:
#             queryset = queryset.filter(stage_id=stage_id)
#         serializer = CourseSerializer(queryset, many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'], url_path='years')
#     def get_years(self, request):
#         course_id = request.query_params.get('course_id')
#         queryset = Year.objects.all()
#         if course_id:
#             queryset = queryset.filter(course_id=course_id)
#         serializer = YearSerializer(queryset, many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'], url_path='exam-types')
#     def get_exam_types(self, request):
#         year_id = request.query_params.get('year_id')
#         queryset = ExamType.objects.all()
#         if year_id:
#             queryset = queryset.filter(year_id=year_id)
#         serializer = ExamTypeSerializer(queryset, many=True)
#         return Response(serializer.data)



from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.text import get_valid_filename
from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from apps.questions.models import Question
from apps.core.models import EducationStage, Course, Year, ExamType
from .serializers import (
    QuestionListSerializer,
    QuestionDetailSerializer,
    QuestionCreateUpdateSerializer,
    EducationStageSerializer,
    CourseSerializer,
    YearSerializer,
    ExamTypeSerializer,
)
from .permissions import IsAdminUser
from .filters import QuestionFilter
from rest_framework.parsers import MultiPartParser, JSONParser


def get_media_type_from_content_type(content_type):
    if content_type.startswith('image/'):
        return 'image'
    if content_type.startswith('audio/'):
        return 'audio'
    if content_type.startswith('video/'):
        return 'video'
    if content_type == 'application/pdf':
        return 'pdf'
    return 'document'



class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet برای مدیریت سوالات"""
    queryset = Question.objects.all().order_by('-created_at')
    parser_classes = [MultiPartParser, JSONParser]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = QuestionFilter
    search_fields = ['question_text', 'id']
    ordering_fields = ['created_at', 'difficulty', 'exam_type__year__years_number']
    ordering = ['-created_at']

    def get_permissions(self):
        """فقط کاربر احراز هویت‌شده ادمین به همه عملیات دسترسی دارد"""
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        return (
            Question.objects
            .select_related(
                'exam_type',
                'exam_type__year',
                'exam_type__year__course',
                'exam_type__year__course__stage',
                'created_by',
            )
            .prefetch_related('choices', 'media_items')
            .all()
            .order_by('-created_at')
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateUpdateSerializer
        return QuestionDetailSerializer

    def perform_create(self, serializer):
        """
        created_by از JWT استخراج می‌شود.
        وقتی JWTAuthentication فعال باشد، request.user از روی توکن پر می‌شود.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='category-tree')
    def category_tree(self, request):
        """درخت دسته‌بندی کامل را برمی‌گرداند"""
        tree = []

        stages = EducationStage.objects.all()

        for stage in stages:
            stage_node = {
                'id': stage.id,
                'name': stage.name_education_stage,
                'type': 'stage',
                'children': []
            }

            courses = Course.objects.filter(stage=stage)
            for course in courses:
                course_node = {
                    'id': course.id,
                    'name': course.name_course,
                    'type': 'course',
                    'children': []
                }

                years = Year.objects.filter(course=course)
                for year in years:
                    year_node = {
                        'id': year.id,
                        'name': f"سال {year.years_number}",
                        'type': 'year',
                        'children': []
                    }

                    exam_types = ExamType.objects.filter(year=year)
                    for exam_type in exam_types:
                        exam_node = {
                            'id': exam_type.id,
                            'name': exam_type.get_name_exam_types_display()
                            if hasattr(exam_type, 'get_name_exam_types_display')
                            else exam_type.name_exam_types,
                            'type': 'exam_type',
                            'question_count': exam_type.questions.count()
                            if hasattr(exam_type, 'questions')
                            else Question.objects.filter(exam_type=exam_type).count()
                        }
                        year_node['children'].append(exam_node)

                    if year_node['children']:
                        course_node['children'].append(year_node)

                if course_node['children']:
                    stage_node['children'].append(course_node)

            if stage_node['children']:
                tree.append(stage_node)

        return Response(tree)

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """آمار سوالات برای داشبورد"""
        total_questions = Question.objects.count()
        mcq_count = Question.objects.filter(question_type='mcq').count()
        descriptive_count = Question.objects.filter(question_type='descriptive').count()

        difficulty_stats = {
            'easy': Question.objects.filter(difficulty='easy').count(),
            'medium': Question.objects.filter(difficulty='medium').count(),
            'hard': Question.objects.filter(difficulty='hard').count(),
            'unknown': Question.objects.filter(difficulty='unknown').count(),
        }

        today = timezone.now().date()
        today_questions = Question.objects.filter(created_at__date=today).count()

        return Response({
            'total_questions': total_questions,
            'mcq_count': mcq_count,
            'descriptive_count': descriptive_count,
            'difficulty_stats': difficulty_stats,
            'today_questions': today_questions
        })

    @action(detail=False, methods=['post'], url_path='upload-media', parser_classes=[MultiPartParser])
    def upload_media(self, request):
        """آپلود فایل‌های سوال/پاسخ و برگرداندن آبجکت سازگار با QuestionMediaSerializer"""
        files = request.FILES.getlist('files')

        if not files:
            return Response(
                {'detail': 'حداقل یک فایل ارسال کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_items = []

        for uploaded_file in files:
            safe_name = get_valid_filename(uploaded_file.name)
            storage_path = f"questions/{uuid4().hex}_{safe_name}"
            saved_path = default_storage.save(storage_path, uploaded_file)
            file_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")

            uploaded_items.append({
                'media_type': get_media_type_from_content_type(uploaded_file.content_type or ''),
                'file_url': file_url,
                'original_file_name': uploaded_file.name,
                'alt_text': '',
            })

        return Response(uploaded_items, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.GenericViewSet):
    """ViewSet برای مدیریت دسته‌بندی‌ها"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'], url_path='stages')
    def get_stages(self, request):
        queryset = EducationStage.objects.all()
        serializer = EducationStageSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='courses')
    def get_courses(self, request):
        stage_id = request.query_params.get('stage_id')
        queryset = Course.objects.all()

        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)

        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='years')
    def get_years(self, request):
        course_id = request.query_params.get('course_id')
        queryset = Year.objects.all()

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        serializer = YearSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='exam-types')
    def get_exam_types(self, request):
        year_id = request.query_params.get('year_id')
        queryset = ExamType.objects.all()

        if year_id:
            queryset = queryset.filter(year_id=year_id)

        serializer = ExamTypeSerializer(queryset, many=True)
        return Response(serializer.data)
