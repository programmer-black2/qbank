# core/serializers.py
from rest_framework import serializers
from apps.core.models import EducationStage, Course, Year, ExamType


class EducationStageSerializer(serializers.ModelSerializer):
    """سریالایزر برای مقطع تحصیلی"""
    courses_count = serializers.IntegerField(source='courses.count', read_only=True)
    
    class Meta:
        model = EducationStage
        fields = ['id', 'name_education_stage', 'courses_count']
    
    def validate_name_education_stage(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("نام مقطع تحصیلی نمی‌تواند خالی باشد")
        return value.strip()


class CourseSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name_education_stage', read_only=True)
    years_count = serializers.IntegerField(source='years.count', read_only=True)
    stage_id = serializers.PrimaryKeyRelatedField(
        source='stage',
        queryset=EducationStage.objects.all(),
        write_only=True,
        help_text="شناسه مقطع تحصیلی"
    )
    
    class Meta:
        model = Course
        fields = [
            'id',
            'name_course',
            'stage_id',
            'stage_name',
            'years_count',
            'is_public_sample',
        ]
    
    def validate_name_course(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("نام دوره نمی‌تواند خالی باشد")
        return value.strip()
    
    def validate(self, data):
        stage = data.get('stage')
        name_course = data.get('name_course')

        if self.instance:
            if stage is None:
                stage = self.instance.stage
            if name_course is None:
                name_course = self.instance.name_course

        if stage and name_course:
            qs = Course.objects.filter(stage=stage, name_course=name_course)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"name_course": "این دوره برای این مقطع قبلاً ثبت شده است"}
                )
        return data


class CoursePublicSampleBulkUpdateSerializer(serializers.Serializer):
    course_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
    is_public_sample = serializers.BooleanField()

    def validate_course_ids(self, value):
        existing_ids = set(Course.objects.filter(id__in=value).values_list('id', flat=True))
        missing_ids = sorted(set(value) - existing_ids)

        if missing_ids:
            raise serializers.ValidationError(
                f"Course ids not found: {', '.join(map(str, missing_ids))}"
            )

        return value


class YearSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name_course', read_only=True)
    exam_types_count = serializers.IntegerField(source='exam_types.count', read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all(),
        write_only=True
    )

    class Meta:
        model = Year
        fields = ['id', 'years_number', 'course_id', 'course_name', 'exam_types_count']

    def validate_years_number(self, value):
        # سال طرح سؤال، مثل 1399، 1400، 1403
        if value < 1200 or value > 1600:
            raise serializers.ValidationError("سال باید یک سال شمسی معتبر باشد (مثلاً 1399، 1403)")
        return value

    def validate(self, data):
        course = data.get('course')
        years_number = data.get('years_number')

        # برای حالت update اگر یکی از این‌ها در data نبود، از instance بگیر
        if self.instance:
            if course is None:
                course = self.instance.course
            if years_number is None:
                years_number = self.instance.years_number

        if course and years_number:
            qs = Year.objects.filter(course=course, years_number=years_number)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"years_number": "این سال برای این دوره قبلاً ثبت شده است"}
                )
        return data



class ExamTypeSerializer(serializers.ModelSerializer):
    year_number = serializers.IntegerField(source='year.years_number', read_only=True)
    course_name = serializers.CharField(source='year.course.name_course', read_only=True)
    stage_name = serializers.CharField(source='year.course.stage.name_education_stage', read_only=True)
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    year_id = serializers.PrimaryKeyRelatedField(
        source='year',
        queryset=Year.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = ExamType
        fields = [
            'id', 'name_exam_types', 'year_id', 'year_number',
            'course_name', 'stage_name', 'questions_count'
        ]
    
    def validate(self, data):
        year = data.get('year')
        name_exam_types = data.get('name_exam_types')

        if self.instance:
            if year is None:
                year = self.instance.year
            if name_exam_types is None:
                name_exam_types = self.instance.name_exam_types

        if year and name_exam_types:
            qs = ExamType.objects.filter(year=year, name_exam_types=name_exam_types)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"name_exam_types": "این نوع آزمون برای این سال قبلاً ثبت شده است"}
                )
        return data


class CategoryNodeSerializer(serializers.Serializer):
    """سریالایزر برای گره‌های درخت دسته‌بندی"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.ChoiceField(choices=['stage', 'course', 'year', 'exam_type'])
    children = serializers.ListField(child=serializers.DictField(), required=False)
    question_count = serializers.IntegerField(required=False)
    metadata = serializers.DictField(required=False)


class CategoryBreadcrumbSerializer(serializers.Serializer):
    """سریالایزر برای مسیر دسته‌بندی (breadcrumb)"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.CharField()
