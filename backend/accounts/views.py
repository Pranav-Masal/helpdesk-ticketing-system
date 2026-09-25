from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
    AgentRegisterSerializer,
    AdminRegisterSerializer,
)


# ===============================
# REGISTER CUSTOMER
# ===============================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ===============================
# CURRENT USER
# ===============================

class MeView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        return Response(
            UserSerializer(request.user).data
        )


# ===============================
# LOGIN
# ===============================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        refresh["role"] = user.role
        refresh["username"] = user.username

        return Response(
            {
                "refresh": str(refresh),
                "access": str(
                    refresh.access_token
                ),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK
        )


# ===============================
# AGENT REGISTER
# ===============================

class AgentRegisterView(generics.CreateAPIView):
    serializer_class = AgentRegisterSerializer
    permission_classes = [AllowAny]


