from django.db import migrations, models


def add_users_column_if_missing(schema_editor, existing_columns, column_name, definition):
    if column_name not in existing_columns:
        schema_editor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {definition}")
        existing_columns.add(column_name)


def add_student_auth_columns(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, "users")
        }

        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "phone_verified",
            "TINYINT(1) NOT NULL DEFAULT 0",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "otp_purpose",
            "VARCHAR(20) NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "otp_code_hash",
            "VARCHAR(64) NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "otp_expires_at",
            "DATETIME NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "otp_attempts",
            "SMALLINT UNSIGNED NOT NULL DEFAULT 0",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "active_student_session_key",
            "VARCHAR(36) NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "active_device_name",
            "VARCHAR(120) NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "active_user_agent",
            "TEXT NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "active_ip_address",
            "VARCHAR(45) NULL",
        )
        add_users_column_if_missing(
            schema_editor,
            existing_columns,
            "active_session_updated_at",
            "DATETIME NULL",
        )

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND index_name = 'uq_users_active_student_session_key'
            """
        )
        if cursor.fetchone()[0] == 0:
            schema_editor.execute(
                "ALTER TABLE users ADD UNIQUE KEY uq_users_active_student_session_key "
                "(active_student_session_key)"
            )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_student_auth_columns, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="phone_verified",
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name="user",
                    name="otp_purpose",
                    field=models.CharField(blank=True, max_length=20, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="otp_code_hash",
                    field=models.CharField(blank=True, max_length=64, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="otp_expires_at",
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="otp_attempts",
                    field=models.PositiveSmallIntegerField(default=0),
                ),
                migrations.AddField(
                    model_name="user",
                    name="active_student_session_key",
                    field=models.CharField(blank=True, max_length=36, null=True, unique=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="active_device_name",
                    field=models.CharField(blank=True, max_length=120, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="active_user_agent",
                    field=models.TextField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="active_ip_address",
                    field=models.CharField(blank=True, max_length=45, null=True),
                ),
                migrations.AddField(
                    model_name="user",
                    name="active_session_updated_at",
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
        ),
    ]
