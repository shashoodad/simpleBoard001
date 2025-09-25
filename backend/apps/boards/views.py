from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from apps.accounts.models import User

from .models import Board, Post
from .serializers import BoardSerializer, PostSerializer, PostWriteSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsPostAuthorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj: Post) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == User.Role.ADMIN:
            return True
        return obj.author_id == request.user.id


class BoardListCreateView(generics.ListCreateAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return super().get_permissions()


class BoardDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in {'PUT', 'PATCH', 'DELETE'}:
            return [IsAdminRole()]
        return super().get_permissions()


class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        board_id = self.kwargs['board_id']
        queryset = Post.objects.filter(board_id=board_id).select_related('author', 'board').prefetch_related(
            'attachments',
            'youtube_embeds',
        )
        view_mode = self.request.query_params.get('view')
        if view_mode in {choice.value for choice in Post.ViewType}:
            queryset = queryset.filter(view_type=view_mode)
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostWriteSerializer
        return PostSerializer

    def perform_create(self, serializer):
        board = get_object_or_404(Board, pk=self.kwargs['board_id'])
        serializer.save(author=self.request.user, board=board)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.select_related('board', 'author').prefetch_related('attachments', 'youtube_embeds')
    permission_classes = [IsPostAuthorOrAdmin]

    def get_serializer_class(self):
        if self.request.method in {'PUT', 'PATCH'}:
            return PostWriteSerializer
        return PostSerializer
