from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Ticket, Comment

User = get_user_model()


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "message", "created_at"]


class TicketSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    assigned_to = serializers.CharField(source="assigned_to.username", read_only=True, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id", "title", "description", "category", "priority", "status",
            "created_by", "assigned_to", "resolution",
            "created_at", "updated_at", "resolved_at", "comments"
        ]
        read_only_fields = [
            "id", "status", "created_by", "assigned_to", "resolution",
            "created_at", "updated_at", "resolved_at"
        ]


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["id", "title", "description", "category", "priority"]
        read_only_fields = ["id"]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["message"]


class AssignSerializer(serializers.Serializer):
    agent_id = serializers.IntegerField()

    def validate_agent_id(self, value):
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Agent not found.")
        if user.role != User.Role.AGENT or not user.is_active:
            raise serializers.ValidationError("Selected user is not an active support agent.")
        return value


class StatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.Status.choices)


class ResolveSerializer(serializers.Serializer):
    resolution = serializers.CharField(min_length=3, allow_blank=False)
