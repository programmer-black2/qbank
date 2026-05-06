# apps/exam/serializers.py (ساده شده)
from rest_framework import serializers
from .models import Exam, ExamQuestion


class ExamSerializer(serializers.ModelSerializer):
    total_questions = serializers.IntegerField(source='exam_questions.count', read_only=True)
    
    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'start_time', 'duration_minutes', 'created_at', 'total_questions']
        read_only_fields = ['id', 'created_at']


class ExamDetailSerializer(ExamSerializer):
    questions = serializers.SerializerMethodField()
    
    class Meta(ExamSerializer.Meta):
        fields = ExamSerializer.Meta.fields + ['questions']
    
    def get_questions(self, obj):
        exam_questions = obj.exam_questions.select_related('question')
        return [
            {
                'id': eq.question.id,
                'question_text': eq.question.question_text,
                'question_type': eq.question.question_type,
                'difficulty': eq.question.difficulty,
            }
            for eq in exam_questions
        ]


class ExamCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['title', 'description', 'start_time', 'duration_minutes']
    
    def validate_duration_minutes(self, value):
        if value <= 0:
            raise serializers.ValidationError("مدت زمان باید بیشتر از صفر باشد")
        return value


class ExamQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'exam_id', 'question_id', 'question_text']