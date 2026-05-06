# core/models.py
from django.db import models


class EducationStage(models.Model):
    id = models.AutoField(primary_key=True)
    name_education_stage = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "education_stages"
        managed = False

    def __str__(self):
        return self.name_education_stage


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    stage = models.ForeignKey(
        EducationStage,
        on_delete=models.DO_NOTHING,
        db_column="stage_id",
        related_name="courses",
    )
    name_course = models.CharField(max_length=150)

    class Meta:
        db_table = "courses"
        managed = False
        unique_together = [["stage", "name_course"]]

    def __str__(self):
        return self.name_course


class Year(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.DO_NOTHING,
        db_column="course_id",
        related_name="years",
    )
    years_number = models.PositiveSmallIntegerField()  # tinyint unsigned

    class Meta:
        db_table = "years"
        managed = False
        unique_together = [["course", "years_number"]]

    def __str__(self):
        return f"{self.course.name_course} - Year {self.years_number}"


class ExamType(models.Model):
    class NameChoices(models.TextChoices):
        MIDTERM = "midterm", "Midterm"
        FINAL = "final", "Final"

    id = models.AutoField(primary_key=True)
    year = models.ForeignKey(
        Year,
        on_delete=models.DO_NOTHING,
        db_column="year_id",
        related_name="exam_types",
    )
    name_exam_types = models.CharField(max_length=20, choices=NameChoices.choices)

    class Meta:
        db_table = "exam_types"
        managed = False
        unique_together = [["year", "name_exam_types"]]

    def __str__(self):
        return f"{self.year} - {self.get_name_exam_types_display()}"