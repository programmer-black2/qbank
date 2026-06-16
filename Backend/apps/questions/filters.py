import django_filters
from apps.questions.models import Question


class QuestionFilter(django_filters.FilterSet):
    question_type = django_filters.CharFilter(method='filter_question_type')
    difficulty = django_filters.CharFilter(method='filter_difficulty')
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

    def filter_question_type(self, queryset, name, value):
        if not value or value == 'all':
            return queryset

        valid_values = {choice[0] for choice in Question.QuestionType.choices}
        if value not in valid_values:
            return queryset.none()

        return queryset.filter(question_type=value)

    def filter_difficulty(self, queryset, name, value):
        if not value or value == 'all':
            return queryset

        valid_values = {choice[0] for choice in Question.Difficulty.choices}
        if value not in valid_values:
            return queryset.none()

        return queryset.filter(difficulty=value)
