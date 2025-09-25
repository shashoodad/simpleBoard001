from django.urls import path

from .views import BoardDetailView, BoardListCreateView, PostDetailView, PostListCreateView

urlpatterns = [
    path('', BoardListCreateView.as_view(), name='board-list'),
    path('<int:pk>/', BoardDetailView.as_view(), name='board-detail'),
    path('<int:board_id>/posts/', PostListCreateView.as_view(), name='post-list'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]
