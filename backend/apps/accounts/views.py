from django.utils.dateparse import parse_datetime
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Registration, User
from .serializers import (
    RegistrationDecisionSerializer,
    RegistrationSerializer,
    UserSerializer,
)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class RegistrationCreateView(generics.CreateAPIView):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class RegistrationListView(generics.ListAPIView):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminRole]


class RegistrationDecisionView(generics.UpdateAPIView):
    queryset = Registration.objects.all()
    serializer_class = RegistrationDecisionSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['patch']


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]


class UserRoleUpdateView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk: int):
        user = generics.get_object_or_404(User, pk=pk)
        role = request.data.get('role')
        premium_until = request.data.get('premiumUntil')
        allowed_roles = {choice.value for choice in User.Role}

        if role and role not in allowed_roles:
            return Response({'detail': '허용되지 않는 역할입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        if role:
            user.role = role

        if premium_until:
            parsed = parse_datetime(premium_until)
            if not parsed:
                return Response({'detail': 'premiumUntil 형식이 잘못되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)
            user.premium_until = parsed

        user.save()
        return Response(UserSerializer(user).data)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
