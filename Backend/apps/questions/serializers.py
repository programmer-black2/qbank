
from rest_framework import serializers
from apps.questions.models import Question, QuestionChoice, QuestionAnswer, QuestionMedia
from apps.core.models import EducationStage, Course, Year, ExamType
from apps.accounts.models import User


class EducationStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationStage
        fields = ['id', 'name_education_stage']
        read_only_fields = ['id']


class CourseSerializer(serializers.ModelSerializer):
    stage_id = serializers.PrimaryKeyRelatedField(
        source='stage',
        queryset=EducationStage.objects.all(),
        required=True
    )

    class Meta:
        model = Course
        fields = ['id', 'name_course', 'stage_id']
        read_only_fields = ['id']


class YearSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all(),
        required=True
    )

    class Meta:
        model = Year
        fields = ['id', 'years_number', 'course_id']
        read_only_fields = ['id']

    def validate_years_number(self, value):
        if value < 1300 or value > 1500:
            raise serializers.ValidationError('سال باید در بازه منطقی شمسی باشد.')
        return value


class ExamTypeSerializer(serializers.ModelSerializer):
    year_id = serializers.PrimaryKeyRelatedField(
        source='year',
        queryset=Year.objects.all(),
        required=True
    )
    year_number = serializers.IntegerField(source='year.years_number', read_only=True)
    course_name = serializers.CharField(source='year.course.name_course', read_only=True)
    stage_name = serializers.CharField(source='year.course.stage.name_education_stage', read_only=True)

    class Meta:
        model = ExamType
        fields = ['id', 'name_exam_types', 'year_id', 'year_number', 'course_name', 'stage_name']
        read_only_fields = ['id']


class CategoryTreeSerializer(serializers.Serializer):
    """سریالایزر برای نمایش درخت دسته‌بندی"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.CharField()  # stage, course, year, exam_type
    children = serializers.ListField(child=serializers.DictField(), required=False)


class QuestionChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoice
        fields = ['id', 'option_text', 'option_number', 'is_correct']
        read_only_fields = ['id']


class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = ['id', 'descriptive_answer_text']
        read_only_fields = ['id']


class QuestionMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionMedia
        fields = ['id', 'media_type', 'file_url', 'original_file_name', 'alt_text']
        read_only_fields = ['id']


class QuestionListSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای لیست سوالات"""
    exam_type_name = serializers.CharField(source='exam_type.name_exam_types', read_only=True)
    year_number = serializers.IntegerField(source='exam_type.year.years_number', read_only=True)
    course_name = serializers.CharField(source='exam_type.year.course.name_course', read_only=True)
    stage_name = serializers.CharField(source='exam_type.year.course.stage.name_education_stage', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    question_type_display = serializers.CharField(source='get_question_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'question_type_display',
            'difficulty', 'difficulty_display', 'created_at', 'updated_at',
            'exam_type_name', 'year_number', 'course_name', 'stage_name',
            'created_by_name'
        ]
        read_only_fields = fields


class StudentQuestionSerializer(serializers.ModelSerializer):
    choices = QuestionChoiceSerializer(many=True, read_only=True)
    answer = QuestionAnswerSerializer(read_only=True)
    media_items = QuestionMediaSerializer(many=True, read_only=True)
    answer_media_items = serializers.SerializerMethodField()
    exam_type_id = serializers.IntegerField(source='exam_type.id', read_only=True)
    exam_type_name = serializers.CharField(source='exam_type.name_exam_types', read_only=True)
    year_id = serializers.IntegerField(source='exam_type.year.id', read_only=True)
    year_number = serializers.IntegerField(source='exam_type.year.years_number', read_only=True)
    course_id = serializers.IntegerField(source='exam_type.year.course.id', read_only=True)
    course_name = serializers.CharField(source='exam_type.year.course.name_course', read_only=True)
    stage_id = serializers.IntegerField(source='exam_type.year.course.stage.id', read_only=True)
    stage_name = serializers.CharField(source='exam_type.year.course.stage.name_education_stage', read_only=True)
    question_type_display = serializers.CharField(source='get_question_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'question_type_display',
            'difficulty', 'difficulty_display', 'created_at', 'updated_at',
            'exam_type_id', 'exam_type_name', 'year_id', 'year_number',
            'course_id', 'course_name', 'stage_id', 'stage_name',
            'choices', 'answer', 'media_items', 'answer_media_items',
        ]
        read_only_fields = fields

    def get_answer_media_items(self, obj):
        if hasattr(obj, 'answer') and obj.answer:
            return QuestionMediaSerializer(obj.answer.media_items.all(), many=True).data
        return []


class QuestionDetailSerializer(serializers.ModelSerializer):
    """سریالایزر کامل برای جزئیات سوال (همراه با رسانه‌های سوال و پاسخ)"""
    choices = QuestionChoiceSerializer(many=True, read_only=True)
    answer = QuestionAnswerSerializer(read_only=True)
    media_items = QuestionMediaSerializer(many=True, read_only=True)          # رسانه‌های خود سوال
    answer_media_items = serializers.SerializerMethodField()                 # رسانه‌های پاسخ تشریحی (جدید)
    exam_type_detail = ExamTypeSerializer(source='exam_type', read_only=True)
    exam_type_id = serializers.IntegerField(source='exam_type.id', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'difficulty',
            'created_at', 'updated_at', 'exam_type_id', 'exam_type_detail',
            'choices', 'answer', 'media_items', 'answer_media_items'
        ]
        read_only_fields = fields

    def get_answer_media_items(self, obj):
        """دریافت رسانه‌های متصل به پاسخ تشریحی (در صورت وجود پاسخ)"""
        if hasattr(obj, 'answer') and obj.answer:
            return QuestionMediaSerializer(obj.answer.media_items.all(), many=True).data
        return []


class QuestionCreateUpdateSerializer(serializers.ModelSerializer):
    """سریالایزر برای ایجاد و ویرایش سوال (پشتیبانی از رسانه و پاسخ تشریحی برای تستی)"""
    exam_type_id = serializers.PrimaryKeyRelatedField(
        source='exam_type',
        queryset=ExamType.objects.all(),
        required=True
    )
    choices = QuestionChoiceSerializer(many=True, required=False)
    answer = QuestionAnswerSerializer(required=False)
    question_media = QuestionMediaSerializer(many=True, required=False)   # رسانه‌های سوال
    answer_media = QuestionMediaSerializer(many=True, required=False)     # رسانه‌های پاسخ

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'difficulty',
            'exam_type_id', 'choices', 'answer', 'question_media', 'answer_media'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        question_type = attrs.get('question_type', getattr(self.instance, 'question_type', None))
        # برای دسترسی به داده‌های ارسالی (حتی اگر required=False) از self.initial_data استفاده می‌کنیم
        choices = self.initial_data.get('choices')
        answer = self.initial_data.get('answer')

        if question_type == 'mcq':
            # اعتبارسنجی گزینه‌ها (اجباری)
            if not choices:
                raise serializers.ValidationError({
                    'choices': 'برای سوال چندگزینه‌ای، گزینه‌ها الزامی هستند.'
                })
            if not isinstance(choices, list) or len(choices) < 2:
                raise serializers.ValidationError({
                    'choices': 'سوال چندگزینه‌ای باید حداقل دو گزینه داشته باشد.'
                })
            correct_count = sum(1 for choice in choices if choice.get('is_correct') is True)
            if correct_count != 1:
                raise serializers.ValidationError({
                    'choices': 'دقیقاً یک گزینه باید صحیح باشد.'
                })
            # پاسخ تشریحی مجاز است (اختیاری)؛ هیچ خطایی نمی‌دهیم

        elif question_type == 'descriptive':
            # پاسخ تشریحی اجباری
            if not answer:
                raise serializers.ValidationError({
                    'answer': 'برای سوال تشریحی، پاسخ تشریحی الزامی است.'
                })
            # گزینه‌ها نباید ارسال شوند
            if choices:
                raise serializers.ValidationError({
                    'choices': 'سوال تشریحی نباید گزینه داشته باشد.'
                })

        return attrs

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        answer_data = validated_data.pop('answer', None)
        question_media_data = validated_data.pop('question_media', [])
        answer_media_data = validated_data.pop('answer_media', [])

        # ایجاد سوال
        question = Question.objects.create(**validated_data)

        # ایجاد گزینه‌ها (اگر وجود داشته باشد)
        for choice_data in choices_data:
            QuestionChoice.objects.create(question=question, **choice_data)

        # ایجاد پاسخ تشریحی (اختیاری – می‌تواند برای تستی هم باشد)
        answer_obj = None
        if answer_data:
            answer_obj = QuestionAnswer.objects.create(question=question, **answer_data)

        # ایجاد رسانه‌های سوال
        for media_item in question_media_data:
            QuestionMedia.objects.create(question=question, **media_item)

        # ایجاد رسانه‌های پاسخ (فقط در صورتی که پاسخ وجود داشته باشد)
        if answer_obj and answer_media_data:
            for media_item in answer_media_data:
                QuestionMedia.objects.create(question_answer=answer_obj, **media_item)

        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', None)
        answer_data = validated_data.pop('answer', None)
        question_media_data = validated_data.pop('question_media', None)
        answer_media_data = validated_data.pop('answer_media', None)

        # به‌روزرسانی فیلدهای سوال
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ---------- مدیریت گزینه‌ها ----------
        if choices_data is not None:
            # حذف گزینه‌های قبلی و ایجاد گزینه‌های جدید
            instance.choices.all().delete()
            for choice_data in choices_data:
                QuestionChoice.objects.create(question=instance, **choice_data)
        elif instance.question_type != 'mcq' and choices_data is None:
            # اگر سوال تشریحی است و قبلاً گزینه‌ای داشته (مثلاً تغییر نوع از MCQ به descriptive)
            instance.choices.all().delete()

        # ---------- مدیریت پاسخ تشریحی ----------
        # توجه: پاسخ تشریحی برای هر دو نوع سوال (تستی و تشریحی) قابل نگهداری است
        if answer_data is not None:
            if hasattr(instance, 'answer'):
                # به‌روزرسانی پاسخ موجود
                answer = instance.answer
                answer.descriptive_answer_text = answer_data.get('descriptive_answer_text', answer.descriptive_answer_text)
                answer.save()
            else:
                # ایجاد پاسخ جدید
                answer = QuestionAnswer.objects.create(question=instance, **answer_data)
        else:
            answer = getattr(instance, 'answer', None)

        # ---------- مدیریت رسانه‌های سوال ----------
        if question_media_data is not None:
            # حذف رسانه‌های قبلی سوال (اگر لیست خالی باشد، همه حذف می‌شوند)
            instance.media_items.all().delete()
            for media_item in question_media_data:
                QuestionMedia.objects.create(question=instance, **media_item)

        # ---------- مدیریت رسانه‌های پاسخ ----------
        if answer_media_data is not None and answer:
            # حذف رسانه‌های قبلی پاسخ
            answer.media_items.all().delete()
            for media_item in answer_media_data:
                QuestionMedia.objects.create(question_answer=answer, **media_item)
        elif answer_media_data is not None and not answer:
            # اگر پاسخ وجود ندارد ولی رسانه برای پاسخ ارسال شده باشد، طبق سلیقه می‌توان خطا داد یا نادیده گرفت
            # در اینجا نادیده گرفته می‌شود (چون منطق تجاری می‌گوید بدون پاسخ، رسانه معنا ندارد)
            pass

        # اگر نوع سوال از descriptive به mcq تغییر کرده باشد، نیازی به حذف پاسخ نیست
        # چون MCQ می‌تواند پاسخ تشریحی داشته باشد (دقیقاً همان چیزی که می‌خواهیم)

        return instance
