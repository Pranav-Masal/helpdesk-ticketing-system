from django.urls import path

from .views import (
    RegisterView,
    MeView,
    AgentRegisterView,
)

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me"
    ),

    path(
        "agent-register/",
        AgentRegisterView.as_view(),
        name="agent-register"
    ),
]