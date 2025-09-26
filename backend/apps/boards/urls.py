from django.urls import path

from .views import BoardAccessManagementView, BoardDetailView, BoardListCreateView, PostDetailView, PostListCreateView

urlpatterns = [
    path('admin/board-access/', BoardAccessManagementView.as_view(), name='board-access-management'),
    path('', BoardListCreateView.as_view(), name='board-list'),
    path('<int:pk>/', BoardDetailView.as_view(), name='board-detail'),
    path('<int:board_id>/posts/', PostListCreateView.as_view(), name='post-list'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]

