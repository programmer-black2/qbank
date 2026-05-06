import django_filters
from apps.questions.models import Question


class QuestionFilter(django_filters.FilterSet):
    question_type = django_filters.ChoiceFilter(choices=Question.QuestionType.choices)
    difficulty = django_filters.ChoiceFilter(choices=Question.Difficulty.choices)
    exam_type_id = django_filters.NumberFilter(field_name='exam_type_id')
    year_id = django_filters.NumberFilter(field_name='exam_type__year_id')
    course_id = django_filters.NumberFilter(field_name='exam_type__year__course_id')
    stage_id = django_filters.NumberFilter(field_name='exam_type__year__course__stage_id')
    created_at_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    search = django_filters.CharFilter(field_name='question_text', lookup_expr='icontains')
    
    class Meta:
        model = Question
        fields = [
            'question_type', 'difficulty', 'exam_type_id', 
            'year_id', 'course_id', 'stage_id'
        ]