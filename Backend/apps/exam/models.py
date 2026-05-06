# exam/models.py
from django.db import models
from apps.accounts.models import User
from apps.questions.models import Question, QuestionChoice


class Exam(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "exams"
        managed = False
        # indexes = [
        #     models.Index(fields=["start_time"], name="idx_exams_start_time"),
        #     models.Index(fields=["created_at"], name="idx_exams_created_at"),
        # ]

    def __str__(self):
        return self.title


class ExamQuestion(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    exam = models.ForeignKey(
        Exam,
        on_delete=models.DO_NOTHING,
        db_column="exam_id",
        related_name="exam_questions",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="exams",
    )

    class Meta:
        db_table = "exam_questions"
        managed = False
        unique_together = [["exam", "question"]]

    def __str__(self):
        return f"Exam {self.exam_id} - Q{self.question_id}"


class StudentExamAttempt(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    student = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="student_id",
        related_name="exam_attempts",
    )
    exam = models.ForeignKey(
        Exam,
        on_delete=models.DO_NOTHING,
        db_column="exam_id",
        related_name="attempts",
    )
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "student_exam_attempts"
        managed = False
        unique_together = [["student", "exam"]]
        # indexes = [
        #     models.Index(fields=["started_at"], name="idx_student_exam_attempts_started_at"),
        # ]

    def __str__(self):
        return f"Attempt #{self.id} - Student {self.student_id}"


class StudentExamAnswer(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    exam_attempt = models.ForeignKey(
        StudentExamAttempt,
        on_delete=models.DO_NOTHING,
        db_column="exam_attempt_id",
        related_name="answers",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="student_exam_answers",
    )
    choice = models.ForeignKey(
        QuestionChoice,
        on_delete=models.DO_NOTHING,
        db_column="choice_id",
        related_name="exam_answers",
    )

    class Meta:
        db_table = "student_exam_answers"
        managed = False
        unique_together = [["exam_attempt", "question"]]

    def __str__(self):
        return f"Answer #{self.id} - Attempt {self.exam_attempt_id}"