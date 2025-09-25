from django.utils import timezone
from rest_framework import serializers

from .models import Registration, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'status',
            'premium_until',
            'organization',
            'purpose',
        ]
        read_only_fields = ['role', 'status']


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['id', 'email', 'name', 'organization', 'purpose', 'memo', 'status', 'submitted_at']
        read_only_fields = ['status', 'submitted_at']


class RegistrationDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['status', 'memo']

    def validate_status(self, value: str) -> str:
        if value not in {Registration.Status.APPROVED, Registration.Status.REJECTED}:
            raise serializers.ValidationError('승인 또는 반려 상태만 허용됩니다.')
        return value

    def update(self, instance: Registration, validated_data: dict):
        request = self.context['request']
        reviewer: User = request.user
        instance.status = validated_data['status']
        instance.memo = validated_data.get('memo', instance.memo)
        instance.decided_by = reviewer
        instance.decided_at = timezone.now()
        instance.save(update_fields=['status', 'memo', 'decided_by', 'decided_at'])
        return instance
