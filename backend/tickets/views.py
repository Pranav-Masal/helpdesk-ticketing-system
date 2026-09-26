from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema

from .models import Ticket, Comment
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    AssignSerializer,
    StatusSerializer,
    ResolveSerializer,
)
from .permissions import IsAgentOrAdmin, IsOwnerOrAgentOrAdmin


User = get_user_model()


# ============================================================
# TICKET LIST + CREATE
# ============================================================

class TicketListCreateView(generics.ListCreateAPIView):

    # Used by drf-spectacular for schema generation.
    # Runtime behavior is controlled by get_queryset().
    queryset = Ticket.objects.all()

    filterset_fields = [
        "status",
        "priority",
        "category",
        "assigned_to",
    ]

    search_fields = [
        "title",
        "description",
        "category",
    ]

    ordering_fields = [
        "created_at",
        "updated_at",
        "priority",
        "status",
    ]

    def get_queryset(self):
        user = self.request.user

        qs = (
            Ticket.objects
            .select_related("created_by", "assigned_to")
            .prefetch_related("comments__author")
        )

        if user.role in [
            User.Role.AGENT,
            User.Role.ADMIN,
        ]:
            return qs

        return qs.filter(created_by=user)

    def get_serializer_class(self):
        return (
            TicketCreateSerializer
            if self.request.method == "POST"
            else TicketSerializer
        )

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


# ============================================================
# TICKET DETAIL
# ============================================================

class TicketDetailView(generics.RetrieveAPIView):

    queryset = (
        Ticket.objects
        .select_related("created_by", "assigned_to")
        .prefetch_related("comments__author")
    )

    serializer_class = TicketSerializer

    permission_classes = [
        permissions.IsAuthenticated,
        IsOwnerOrAgentOrAdmin,
    ]


# ============================================================
# COMMENTS
# ============================================================

class CommentCreateView(generics.ListCreateAPIView):

    # Used by drf-spectacular.
    # Actual queryset is controlled by get_queryset().
    queryset = Comment.objects.all()

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        ticket = get_object_or_404(
            Ticket,
            pk=self.kwargs["ticket_id"]
        )

        user = self.request.user

        if (
            user.role == User.Role.CUSTOMER
            and ticket.created_by_id != user.id
        ):
            return Comment.objects.none()

        return (
            Comment.objects
            .filter(ticket=ticket)
            .select_related("author")
            .order_by("created_at")
        )

    def get_serializer_class(self):
        return (
            CommentCreateSerializer
            if self.request.method == "POST"
            else CommentSerializer
        )

    def perform_create(self, serializer):
        ticket = get_object_or_404(
            Ticket,
            pk=self.kwargs["ticket_id"]
        )

        user = self.request.user

        if (
            user.role == User.Role.CUSTOMER
            and ticket.created_by_id != user.id
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You cannot comment on this ticket."
            )

        Comment.objects.create(
            ticket=ticket,
            author=user,
            message=serializer.validated_data["message"],
        )


# ============================================================
# ASSIGN TICKET
# ============================================================

@extend_schema(
    request=AssignSerializer,
    responses=TicketSerializer,
)
@api_view(["PATCH"])
@permission_classes([IsAgentOrAdmin])
def assign_ticket(request, ticket_id):

    ticket = get_object_or_404(
        Ticket,
        pk=ticket_id
    )

    serializer = AssignSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    agent = get_object_or_404(
        User,
        pk=serializer.validated_data["agent_id"],
        role=User.Role.AGENT,
        is_active=True,
    )

    ticket.assigned_to = agent

    if ticket.status == Ticket.Status.OPEN:
        ticket.status = Ticket.Status.ASSIGNED

    ticket.save(
        update_fields=[
            "assigned_to",
            "status",
            "updated_at",
        ]
    )

    return Response(
        TicketSerializer(ticket).data
    )


# ============================================================
# UPDATE STATUS
# ============================================================

@extend_schema(
    request=StatusSerializer,
    responses=TicketSerializer,
)
@api_view(["PATCH"])
@permission_classes([IsAgentOrAdmin])
def update_status(request, ticket_id):

    ticket = get_object_or_404(
        Ticket,
        pk=ticket_id
    )

    serializer = StatusSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    new_status = serializer.validated_data["status"]

    ticket.status = new_status

    if (
        new_status == Ticket.Status.RESOLVED
        and not ticket.resolved_at
    ):
        ticket.resolved_at = timezone.now()

    ticket.save()

    return Response(
        TicketSerializer(ticket).data
    )


# ============================================================
# RESOLVE TICKET
# ============================================================

@extend_schema(
    request=ResolveSerializer,
    responses=TicketSerializer,
)
@api_view(["POST"])
@permission_classes([IsAgentOrAdmin])
def resolve_ticket(request, ticket_id):

    ticket = get_object_or_404(
        Ticket,
        pk=ticket_id
    )

    serializer = ResolveSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    ticket.resolution = serializer.validated_data[
        "resolution"
    ]

    ticket.status = Ticket.Status.RESOLVED

    ticket.resolved_at = timezone.now()

    ticket.save()

    return Response(
        TicketSerializer(ticket).data
    )


# ============================================================
# CLOSE TICKET
# ============================================================

@extend_schema(
    request=None,
    responses={
        200: TicketSerializer,
        400: OpenApiTypes.OBJECT,
        403: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def close_ticket(request, ticket_id):

    ticket = get_object_or_404(
        Ticket,
        pk=ticket_id
    )

    if (
        ticket.created_by_id != request.user.id
        and request.user.role != User.Role.ADMIN
    ):
        return Response(
            {
                "detail":
                "Only the ticket owner or admin can close this ticket."
            },
            status=403,
        )

    if ticket.status != Ticket.Status.RESOLVED:
        return Response(
            {
                "detail":
                "Only resolved tickets can be closed."
            },
            status=400,
        )

    ticket.status = Ticket.Status.CLOSED

    ticket.save()

    return Response(
        TicketSerializer(ticket).data
    )


# ============================================================
# AGENTS LIST
# ============================================================

@extend_schema(
    responses=OpenApiTypes.OBJECT,
)
@api_view(["GET"])
@permission_classes([IsAgentOrAdmin])
def agents_list(request):

    agents = (
        User.objects
        .filter(
            role=User.Role.AGENT
        )
        .order_by("username")
    )

    return Response([
        {
            "id": agent.id,
            "username": agent.username,
            "email": agent.email,
            "is_active": agent.is_active,
        }
        for agent in agents
    ])


# ============================================================
# PENDING AGENTS
# ============================================================

@extend_schema(
    responses=OpenApiTypes.OBJECT,
)
@api_view(["GET"])
@permission_classes([IsAgentOrAdmin])
def pending_agents_list(request):

    if request.user.role != User.Role.ADMIN:
        return Response(
            {
                "detail":
                "Only admins can view pending agents."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    agents = (
        User.objects
        .filter(
            role=User.Role.AGENT,
            approval_status=User.ApprovalStatus.PENDING,
        )
        .order_by("date_joined")
    )

    return Response([
        {
            "id": agent.id,
            "username": agent.username,
            "email": agent.email,
            "approval_status": agent.approval_status,
            "created_at": agent.date_joined,
        }
        for agent in agents
    ])


# ============================================================
# APPROVE / REJECT AGENT
# ============================================================

@extend_schema(
    request=OpenApiTypes.OBJECT,
    responses=OpenApiTypes.OBJECT,
)
@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_agent_approval(request, agent_id):

    if request.user.role != User.Role.ADMIN:
        return Response(
            {
                "detail":
                "Only admins can approve or reject agents."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        agent = User.objects.get(
            pk=agent_id,
            role=User.Role.AGENT,
        )

    except User.DoesNotExist:
        return Response(
            {
                "detail":
                "Agent not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    approval_status = request.data.get(
        "approval_status"
    )

    if approval_status not in [
        User.ApprovalStatus.APPROVED,
        User.ApprovalStatus.REJECTED,
    ]:
        return Response(
            {
                "detail":
                "approval_status must be APPROVED or REJECTED."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    agent.approval_status = approval_status

    if (
        approval_status
        == User.ApprovalStatus.APPROVED
    ):
        agent.is_active = True

    else:
        agent.is_active = False

    agent.save(
        update_fields=[
            "approval_status",
            "is_active",
        ]
    )

    return Response({
        "id": agent.id,
        "username": agent.username,
        "email": agent.email,
        "role": agent.role,
        "approval_status": agent.approval_status,
        "is_active": agent.is_active,
        "message": (
            "Agent approved successfully."
            if approval_status
            == User.ApprovalStatus.APPROVED
            else
            "Agent rejected successfully."
        ),
    })


# ============================================================
# DASHBOARD STATS
# ============================================================

@extend_schema(
    responses=OpenApiTypes.OBJECT,
)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):

    qs = Ticket.objects.all()

    if request.user.role == User.Role.CUSTOMER:
        qs = qs.filter(
            created_by=request.user
        )

    return Response({
        "total": qs.count(),

        "open": qs.filter(
            status=Ticket.Status.OPEN
        ).count(),

        "assigned": qs.filter(
            status=Ticket.Status.ASSIGNED
        ).count(),

        "in_progress": qs.filter(
            status=Ticket.Status.IN_PROGRESS
        ).count(),

        "resolved": qs.filter(
            status=Ticket.Status.RESOLVED
        ).count(),

        "closed": qs.filter(
            status=Ticket.Status.CLOSED
        ).count(),

        "urgent": qs.filter(
            priority=Ticket.Priority.URGENT
        ).count(),
    })


# ============================================================
# TOGGLE AGENT STATUS
# ============================================================

@extend_schema(
    request=None,
    responses={
        200: OpenApiTypes.OBJECT,
        403: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def toggle_agent_status(request, agent_id):

    if request.user.role != User.Role.ADMIN:
        return Response(
            {
                "detail":
                "Only admins can manage agents."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        agent = User.objects.get(
            pk=agent_id,
            role=User.Role.AGENT,
        )

    except User.DoesNotExist:
        return Response(
            {
                "detail":
                "Agent not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    agent.is_active = not agent.is_active

    agent.save(
        update_fields=["is_active"]
    )

    return Response({
        "id": agent.id,
        "username": agent.username,
        "email": agent.email,
        "is_active": agent.is_active,
        "message": (
            "Agent activated."
            if agent.is_active
            else "Agent deactivated."
        ),
    })