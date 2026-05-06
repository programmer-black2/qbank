# questions/models.py
from django.db import models
from apps.accounts.models import User
from apps.core.models import ExamType


class QuestionWorkflowStatus(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "question_workflow_statuses"
        managed = False

    def __str__(self):
        return self.name


class Question(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = "mcq", "Multiple Choice"
        DESCRIPTIVE = "descriptive", "Descriptive"

    class Difficulty(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"
        UNKNOWN = "unknown", "Unknown"

    id = models.BigAutoField(primary_key=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="created_by",
        related_name="created_questions",
    )
    exam_type = models.ForeignKey(
        ExamType,
        on_delete=models.DO_NOTHING,
        db_column="exam_type_id",
        related_name="questions",
    )
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.UNKNOWN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "questions"
        managed = False
        # indexes = [
        #     models.Index(fields=["question_type"], name="idx_questions_question_type"),
        #     models.Index(fields=["difficulty"], name="idx_questions_difficulty"),
        #     models.Index(fields=["created_at"], name="idx_questions_created_at"),
        # ]

    def __str__(self):
        return f"Question #{self.id}"


class QuestionAnswer(models.Model):
    id = models.BigAutoField(primary_key=True)
    question = models.OneToOneField(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="answer",
    )
    descriptive_answer_text = models.TextField()

    class Meta:
        db_table = "question_answers"
        managed = False

    def __str__(self):
        return f"Answer for Q{self.question_id}"


class QuestionChoice(models.Model):
    id = models.BigAutoField(primary_key=True)
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="choices",
    )
    option_text = models.TextField()
    option_number = models.PositiveSmallIntegerField()  # 1-10
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = "question_choices"
        managed = False
        unique_together = [
            ["question", "option_number"],  # uq_question_choices_question_option
            ["id", "question"],  # uq_question_choices_id_question_id (added by ALTER)
        ]
        # indexes = [
        #     models.Index(fields=["question", "is_correct"], name="idx_question_choices_question_is_correct"),
        # ]

    def __str__(self):
        return f"Q{self.question_id} - Option {self.option_number}"


class QuestionLike(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="user_id",
        related_name="question_likes",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "question_likes"
        managed = False
        unique_together = [["user", "question"]]

    def __str__(self):
        return f"User {self.user_id} liked Q{self.question_id}"


class QuestionMedia(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        AUDIO = "audio", "Audio"
        VIDEO = "video", "Video"
        PDF = "pdf", "PDF"
        DOCUMENT = "document", "Document"

    id = models.BigAutoField(primary_key=True)
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="media_items",
        null=True,
        blank=True,
    )
    question_answer = models.ForeignKey(
        QuestionAnswer,
        on_delete=models.DO_NOTHING,
        db_column="question_answer_id",
        related_name="media_items",
        null=True,
        blank=True,
    )
    media_type = models.CharField(max_length=20, choices=MediaType.choices)
    file_url = models.CharField(max_length=2048)
    original_file_name = models.CharField(max_length=255, null=True, blank=True)
    alt_text = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "question_media"
        managed = False

    def __str__(self):
        return f"{self.media_type} for Q{self.question_id or self.question_answer_id}"


class QuestionReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RESOLVED = "resolved", "Resolved"

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="user_id",
        related_name="question_reports",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="reports",
    )
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "question_reports"
        managed = False
        # indexes = [
        #     models.Index(fields=["status"], name="idx_question_reports_status"),
        # ]

    def __str__(self):
        return f"Report #{self.id} - Q{self.question_id}"


class QuestionSelectedOption(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="user_id",
        related_name="selected_options",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="selected_options",
    )
    choice = models.ForeignKey(
        QuestionChoice,
        on_delete=models.DO_NOTHING,
        db_column="choice_id",
        related_name="selected_by_users",
    )
    selected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "question_selected_options"
        managed = False
        unique_together = [["user", "question"]]

    def __str__(self):
        return f"User {self.user_id} selected choice {self.choice_id} for Q{self.question_id}"


class QuestionStatusHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    question = models.ForeignKey(
        Question,
        on_delete=models.DO_NOTHING,
        db_column="question_id",
        related_name="status_history",
    )
    old_status = models.ForeignKey(
        QuestionWorkflowStatus,
        on_delete=models.DO_NOTHING,
        db_column="old_status_id",
        related_name="history_from",
        null=True,
        blank=True,
    )
    new_status = models.ForeignKey(
        QuestionWorkflowStatus,
        on_delete=models.DO_NOTHING,
        db_column="new_status_id",
        related_name="history_to",
    )
    changed_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_column="changed_by",
        related_name="question_status_changes",
    )
    note = models.TextField(null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "question_status_history"
        managed = False
        # indexes = [
        #     models.Index(fields=["changed_by", "changed_at"], name="idx_question_status_history_changed_by_changed_at"),
        # ]

    def __str__(self):
        return f"History #{self.id} - Q{self.question_id}"