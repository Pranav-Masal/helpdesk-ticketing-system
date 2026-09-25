from django.contrib import admin
from .models import Ticket, Comment

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_by", "assigned_to", "priority", "status", "created_at")
    list_filter = ("status", "priority", "category")
    search_fields = ("title", "description", "created_by__username", "assigned_to__username")
    readonly_fields = ("created_at", "updated_at", "resolved_at")

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "ticket", "author", "created_at")
    search_fields = ("message", "author__username")
