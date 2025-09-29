from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status

from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer

from .models import Board, BoardAccess, Post
from .serializers import BoardAccessUpdateSerializer, BoardSerializer, BoardSummarySerializer, PostSerializer, PostWriteSerializer


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

    def get_queryset(self):
        user = self.request.user
        base_queryset = Board.objects.all()
        if not user.is_authenticated:
            return base_queryset.none()
        if user.role == User.Role.ADMIN:
            return base_queryset.order_by('name')

        allowed_board_ids = list(BoardAccess.objects.filter(user=user, can_view=True).values_list('board_id', flat=True))
        role_visibility = {
            User.Role.BASIC: ['basic'],
            User.Role.PREMIUM: ['basic', 'premium'],
        }
        visibility_levels = role_visibility.get(user.role, ['basic'])
        visibility_filter = Q(visibility__in=visibility_levels)
        if allowed_board_ids:
            visibility_filter |= Q(id__in=allowed_board_ids)
        return base_queryset.filter(visibility_filter).distinct().order_by('name')


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
        serializer.save(board=board)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.select_related('board', 'author').prefetch_related('attachments', 'youtube_embeds')
    permission_classes = [IsPostAuthorOrAdmin]

    def get_serializer_class(self):
        if self.request.method in {'PUT', 'PATCH'}:
            return PostWriteSerializer
        return PostSerializer



class BoardAccessManagementView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        boards = Board.objects.order_by("name")
        users = User.objects.order_by("email")
        access_entries = BoardAccess.objects.filter(can_view=True)
        access_map: dict[str, list[int]] = {}
        for entry in access_entries:
            access_map.setdefault(str(entry.user_id), []).append(entry.board_id)
        return Response(
            {
                "boards": BoardSummarySerializer(boards, many=True).data,
                "users": UserSerializer(users, many=True).data,
                "access": access_map,
            }
        )

    def put(self, request):
        serializer = BoardAccessUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data["userId"]
        board_ids = serializer.validated_data["boardIds"]
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "존재하지 않는 사용자입니다."}, status=status.HTTP_404_NOT_FOUND)

        valid_board_ids = list(Board.objects.filter(id__in=board_ids).values_list("id", flat=True))

        with transaction.atomic():
            BoardAccess.objects.filter(user=user).delete()
            BoardAccess.objects.bulk_create(
                [BoardAccess(user=user, board_id=board_id, can_view=True) for board_id in valid_board_ids]
            )

        return Response({"userId": user.id, "boardIds": valid_board_ids})



