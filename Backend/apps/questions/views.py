from uuid import uuid4
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Count, OuterRef, Prefetch, Q, Subquery
from django.utils.text import get_valid_filename
from rest_framework import status, viewsets, filters, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from apps.accounts.models import Role
from apps.questions.models import Question, QuestionReport, QuestionStatusHistory, QuestionWorkflowStatus
from apps.core.models import EducationStage, Course, Year, ExamType
from .serializers import (
    QuestionListSerializer,
    QuestionDetailSerializer,
    QuestionCreateUpdateSerializer,
    StudentQuestionSerializer,
    StudentQuestionAnswerSerializer,
    StudentQuestionReportSerializer,
    AdminQuestionReportSerializer,
    AdminQuestionReportStatusSerializer,
    EducationStageSerializer,
    CourseSerializer,
    YearSerializer,
    ExamTypeSerializer,
)
from .permissions import HasActiveSubscription, IsAdminUser, IsWriterUser
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


WORKFLOW_PENDING = 'pending'
WORKFLOW_APPROVED = 'approved'
WORKFLOW_REJECTED = 'rejected'

WORKFLOW_STATUS_DEFAULTS = {
    WORKFLOW_PENDING: {
        'name': 'در انتظار تایید',
        'description': 'سوال ثبت شده و منتظر بررسی ادمین است.',
    },
    WORKFLOW_APPROVED: {
        'name': 'تایید شده',
        'description': 'سوال توسط ادمین تایید شده و قابل انتشار است.',
    },
    WORKFLOW_REJECTED: {
        'name': 'رد شده',
        'description': 'سوال توسط ادمین رد شده است.',
    },
}


def get_workflow_status(code):
    defaults = WORKFLOW_STATUS_DEFAULTS[code]
    status_obj, _ = QuestionWorkflowStatus.objects.get_or_create(
        code=code,
        defaults=defaults,
    )
    return status_obj


def set_question_workflow_status(question, new_status_code, changed_by, note=None):
    new_status = get_workflow_status(new_status_code)
    old_status_id = (
        QuestionStatusHistory.objects
        .filter(question=question)
        .order_by('-changed_at', '-id')
        .values_list('new_status_id', flat=True)
        .first()
    )

    QuestionStatusHistory.objects.create(
        question=question,
        old_status_id=old_status_id,
        new_status=new_status,
        changed_by=changed_by,
        note=note,
    )
    return new_status


def with_current_workflow_status(queryset):
    latest_history = (
        QuestionStatusHistory.objects
        .filter(question_id=OuterRef('pk'))
        .order_by('-changed_at', '-id')
    )

    return queryset.annotate(
        current_status_id=Subquery(latest_history.values('new_status_id')[:1]),
        current_status_code=Subquery(latest_history.values('new_status__code')[:1]),
        current_status_name=Subquery(latest_history.values('new_status__name')[:1]),
    )


def filter_visible_questions(queryset):
    return with_current_workflow_status(queryset).filter(
        Q(current_status_code=WORKFLOW_APPROVED) | Q(current_status_code__isnull=True)
    )


def get_public_sample_question_counts_by_exam_type():
    return dict(
        filter_visible_questions(
            Question.objects.filter(exam_type__year__course__is_public_sample=True)
        )
        .values('exam_type_id')
        .annotate(question_count=Count('id'))
        .values_list('exam_type_id', 'question_count')
    )



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
        queryset = (
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
        queryset = with_current_workflow_status(queryset)

        workflow_status = self.request.query_params.get('workflow_status')
        if workflow_status:
            queryset = queryset.filter(current_status_code=workflow_status)

        return queryset

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
        question = serializer.save(created_by=self.request.user)
        initial_status = (
            WORKFLOW_APPROVED
            if self.request.user.role.name_roles == Role.NameChoices.ADMIN
            else WORKFLOW_PENDING
        )
        set_question_workflow_status(
            question,
            initial_status,
            self.request.user,
            note='وضعیت اولیه پس از ثبت سوال',
        )

    def perform_update(self, serializer):
        question = serializer.save()

        if self.request.user.role.name_roles == Role.NameChoices.WRITER:
            set_question_workflow_status(
                question,
                WORKFLOW_PENDING,
                self.request.user,
                note='ویرایش سوال توسط نویسنده و ارسال دوباره برای بررسی',
            )

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

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        queryset = self.get_queryset()
        notifications = (
            QuestionStatusHistory.objects
            .filter(
                question__created_by=request.user,
                changed_by__role__name_roles=Role.NameChoices.ADMIN,
                new_status__code__in=[WORKFLOW_APPROVED, WORKFLOW_REJECTED],
            )
            .select_related('question', 'new_status', 'changed_by')
            .order_by('-changed_at', '-id')[:10]
        )

        return Response({
            'stats': {
                'total': queryset.count(),
                'pending': queryset.filter(current_status_code=WORKFLOW_PENDING).count(),
                'approved': queryset.filter(current_status_code=WORKFLOW_APPROVED).count(),
                'rejected': queryset.filter(current_status_code=WORKFLOW_REJECTED).count(),
            },
            'notifications': [
                {
                    'id': item.id,
                    'question_id': item.question_id,
                    'question_text': item.question.question_text,
                    'status_code': item.new_status.code,
                    'status_name': item.new_status.name,
                    'changed_by_name': item.changed_by.full_name,
                    'note': item.note,
                    'changed_at': item.changed_at,
                }
                for item in notifications
            ],
        })

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        question = self.get_object()
        set_question_workflow_status(
            question,
            WORKFLOW_APPROVED,
            request.user,
            note=request.data.get('note') or 'تایید توسط ادمین',
        )
        serializer = QuestionDetailSerializer(question)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        question = self.get_object()
        set_question_workflow_status(
            question,
            WORKFLOW_REJECTED,
            request.user,
            note=request.data.get('note') or 'رد توسط ادمین',
        )
        serializer = QuestionDetailSerializer(question)
        return Response(serializer.data)

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


class StudentQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasActiveSubscription]
    serializer_class = StudentQuestionSerializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = QuestionFilter
    search_fields = ['question_text', 'id']
    ordering_fields = [
        'created_at',
        'difficulty',
        'exam_type__year__years_number',
        'exam_type__year__course__name_course',
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = (
            Question.objects
            .select_related(
                'exam_type',
                'exam_type__year',
                'exam_type__year__course',
                'exam_type__year__course__stage',
            )
            .prefetch_related('choices', 'media_items', 'answer__media_items')
            .all()
            .order_by('-created_at')
        )
        return filter_visible_questions(queryset)

    @extend_schema(
        responses={200: StudentQuestionAnswerSerializer},
        description='Return the answer sheet for one student question.',
    )
    @action(detail=True, methods=['get'], url_path='answer')
    def answer(self, request, pk=None):
        question = self.get_object()
        serializer = StudentQuestionAnswerSerializer(question)
        return Response(serializer.data)

    @extend_schema(
        request=StudentQuestionReportSerializer,
        responses={201: StudentQuestionReportSerializer},
        description='Create a pending report for one student question.',
    )
    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        question = self.get_object()
        serializer = StudentQuestionReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            user=request.user,
            question=question,
            status=QuestionReport.Status.PENDING,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='category-tree')
    def category_tree(self, request):
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
        stages = (
            EducationStage.objects
            .prefetch_related(Prefetch('courses', queryset=courses_queryset))
            .order_by('id')
        )

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
                    'children': []
                }

                for year in course.years.all():
                    year_node = {
                        'id': year.id,
                        'name': f"Year {year.years_number}",
                        'type': 'year',
                        'children': []
                    }

                    for exam_type in year.exam_types.all():
                        year_node['children'].append({
                            'id': exam_type.id,
                            'name': exam_type.get_name_exam_types_display(),
                            'type': 'exam_type',
                            'question_count': exam_type.questions_count
                        })

                    course_node['children'].append(year_node)

                stage_node['children'].append(course_node)

            tree.append(stage_node)

        return Response(tree)


class PublicQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = StudentQuestionSerializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = QuestionFilter
    search_fields = ['question_text', 'id']
    ordering_fields = [
        'created_at',
        'difficulty',
        'exam_type__year__years_number',
        'exam_type__year__course__name_course',
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = (
            Question.objects
            .select_related(
                'exam_type',
                'exam_type__year',
                'exam_type__year__course',
                'exam_type__year__course__stage',
            )
            .prefetch_related('choices', 'media_items', 'answer__media_items')
            .filter(exam_type__year__course__is_public_sample=True)
            .order_by('-created_at')
        )
        return filter_visible_questions(queryset)

    @extend_schema(
        responses={200: StudentQuestionAnswerSerializer},
        description='Return the answer sheet for one public sample question.',
    )
    @action(detail=True, methods=['get'], url_path='answer')
    def answer(self, request, pk=None):
        question = self.get_object()
        serializer = StudentQuestionAnswerSerializer(question)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='category-tree')
    def category_tree(self, request):
        tree = []
        public_question_counts = get_public_sample_question_counts_by_exam_type()

        exam_types_queryset = ExamType.objects.order_by('name_exam_types')
        years_queryset = Year.objects.prefetch_related(
            Prefetch('exam_types', queryset=exam_types_queryset)
        ).order_by('years_number')
        courses_queryset = Course.objects.filter(
            is_public_sample=True
        ).prefetch_related(
            Prefetch('years', queryset=years_queryset)
        ).order_by('name_course')
        stages = (
            EducationStage.objects
            .prefetch_related(Prefetch('courses', queryset=courses_queryset))
            .order_by('id')
        )

        for stage in stages:
            public_courses = list(stage.courses.all())
            if not public_courses:
                continue

            stage_node = {
                'id': stage.id,
                'name': stage.name_education_stage,
                'type': 'stage',
                'children': []
            }

            for course in public_courses:
                course_node = {
                    'id': course.id,
                    'name': course.name_course,
                    'type': 'course',
                    'is_public_sample': course.is_public_sample,
                    'children': []
                }

                for year in course.years.all():
                    year_node = {
                        'id': year.id,
                        'name': f"Year {year.years_number}",
                        'type': 'year',
                        'children': []
                    }

                    for exam_type in year.exam_types.all():
                        question_count = public_question_counts.get(exam_type.id, 0)
                        if question_count == 0:
                            continue

                        year_node['children'].append({
                            'id': exam_type.id,
                            'name': exam_type.get_name_exam_types_display(),
                            'type': 'exam_type',
                            'question_count': question_count
                        })

                    if year_node['children']:
                        course_node['children'].append(year_node)

                if course_node['children']:
                    stage_node['children'].append(course_node)

            if stage_node['children']:
                tree.append(stage_node)

        return Response(tree)


class AuthorQuestionViewSet(QuestionViewSet):
    """Question CRUD for writers. Writers can only manage their own questions."""

    def get_permissions(self):
        return [IsAuthenticated(), IsWriterUser()]

    def get_queryset(self):
        return super().get_queryset().filter(created_by=self.request.user)

    def perform_create(self, serializer):
        question = serializer.save(created_by=self.request.user)
        set_question_workflow_status(
            question,
            WORKFLOW_PENDING,
            self.request.user,
            note='ثبت سوال توسط نویسنده و ارسال برای بررسی',
        )

    def perform_update(self, serializer):
        question = serializer.save()
        set_question_workflow_status(
            question,
            WORKFLOW_PENDING,
            self.request.user,
            note='ویرایش سوال توسط نویسنده و ارسال دوباره برای بررسی',
        )

    def approve(self, request, pk=None):
        return Response(
            {'detail': 'نویسنده اجازه تایید سوال برای انتشار را ندارد.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    def reject(self, request, pk=None):
        return Response(
            {'detail': 'نویسنده اجازه رد سوال را ندارد.'},
            status=status.HTTP_403_FORBIDDEN,
        )


class QuestionReportViewSet(mixins.ListModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'message',
        'user__full_name',
        'user__phone',
        'question__question_text',
    ]
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at', '-id']

    def get_queryset(self):
        queryset = QuestionReport.objects.select_related(
            'user',
            'question',
        ).order_by('-created_at', '-id')

        status_value = self.request.query_params.get('status')
        if status_value:
            queryset = queryset.filter(status=status_value)

        question_id = self.request.query_params.get('question_id')
        if question_id:
            queryset = queryset.filter(question_id=question_id)

        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return AdminQuestionReportStatusSerializer
        return AdminQuestionReportSerializer

    @extend_schema(
        request=AdminQuestionReportStatusSerializer,
        responses={200: AdminQuestionReportSerializer},
        description='Update report status to pending or resolved.',
    )
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = AdminQuestionReportStatusSerializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminQuestionReportSerializer(instance).data)


class CategoryViewSet(viewsets.GenericViewSet):
    """ViewSet برای مدیریت دسته‌بندی‌ها"""
    permission_classes = [AllowAny]

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
