from rest_framework.permissions import BasePermission
from accounts.models import User

class IsAgentOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            User.Role.AGENT, User.Role.ADMIN
        ]

class IsOwnerOrAgentOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            obj.created_by_id == request.user.id
            or request.user.role in [User.Role.AGENT, User.Role.ADMIN]
        )
