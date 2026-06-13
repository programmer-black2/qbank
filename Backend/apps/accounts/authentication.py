from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import Role


class StudentSessionJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        if not (
            user.role
            and user.role.name_roles == Role.NameChoices.STUDENT
        ):
            return user

        token_session = validated_token.get("student_session")
        if not token_session:
            raise AuthenticationFailed("نشست دانشجو معتبر نیست", code="invalid_student_session")

        if str(user.active_student_session_key or "") != str(token_session):
            raise AuthenticationFailed("این حساب روی دستگاه دیگری وارد شده است", code="student_session_replaced")

        return user
