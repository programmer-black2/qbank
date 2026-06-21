from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE courses "
                "ADD COLUMN is_public_sample TINYINT(1) NOT NULL DEFAULT 0"
            ),
            reverse_sql=(
                "ALTER TABLE courses "
                "DROP COLUMN is_public_sample"
            ),
        ),
    ]
