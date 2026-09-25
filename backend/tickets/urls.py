from django.urls import path

from .views import (
    TicketListCreateView,
    TicketDetailView,
    CommentCreateView,
    assign_ticket,
    update_status,
    resolve_ticket,
    close_ticket,
    agents_list,
    dashboard_stats,
    toggle_agent_status,
    pending_agents_list,
    update_agent_approval,
)

urlpatterns = [

    path(
        "",
        TicketListCreateView.as_view(),
        name="ticket-list-create"
    ),

    path(
        "<int:pk>/",
        TicketDetailView.as_view(),
        name="ticket-detail"
    ),

    path(
        "<int:ticket_id>/comments/",
        CommentCreateView.as_view(),
        name="ticket-comments"
    ),

    path(
        "<int:ticket_id>/assign/",
        assign_ticket,
        name="ticket-assign"
    ),

    path(
        "<int:ticket_id>/status/",
        update_status,
        name="ticket-status"
    ),

    path(
        "<int:ticket_id>/resolve/",
        resolve_ticket,
        name="ticket-resolve"
    ),

    path(
        "<int:ticket_id>/close/",
        close_ticket,
        name="ticket-close"
    ),

    path(
        "agents/",
        agents_list,
        name="agents-list"
    ),
    path("agents/pending/", pending_agents_list, name="pending-agents"),

    path(
    "agents/<int:agent_id>/approval/",
    update_agent_approval,
    name="agent-approval"
),

    path(
    "agents/<int:agent_id>/toggle/",
    toggle_agent_status,
    name="toggle-agent-status"
),

    path(
        "dashboard/stats/",
        dashboard_stats,
        name="dashboard-stats"
    ),
]