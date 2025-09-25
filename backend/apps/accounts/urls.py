from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CurrentUserView,
    RegistrationCreateView,
    RegistrationDecisionView,
    RegistrationListView,
    UserListView,
    UserRoleUpdateView,
)

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('registrations/', RegistrationCreateView.as_view(), name='registration-create'),
    path('admin/registrations/', RegistrationListView.as_view(), name='registration-list'),
    path('admin/registrations/<int:pk>/', RegistrationDecisionView.as_view(), name='registration-decision'),
    path('admin/users/', UserListView.as_view(), name='user-list'),
    path('admin/users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
]
