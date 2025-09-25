from django.contrib import admin

from .models import Registration, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'status', 'premium_until', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser')


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'status', 'submitted_at', 'decided_at')
    list_filter = ('status',)
    search_fields = ('email', 'name', 'organization')
