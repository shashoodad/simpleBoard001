from __future__ import annotations

from django.conf import settings
from django.db import models


class Board(models.Model):
    class Visibility(models.TextChoices):
        BASIC = 'basic', 'Basic'
        PREMIUM = 'premium', 'Premium'
        ADMIN = 'admin', 'Admin'

    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.BASIC)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class Post(models.Model):
    class ViewType(models.TextChoices):
        CARD = 'card', 'Card'
        LIST = 'list', 'List'

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    view_type = models.CharField(max_length=10, choices=ViewType.choices, default=ViewType.CARD)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.title}'


def attachment_upload_path(instance: 'Attachment', filename: str) -> str:
    return f'uploads/{instance.post.created_at:%Y/%m}/{filename}'


class Attachment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=attachment_upload_path)
    original_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = self.file.size
        if self.file and not self.original_name:
            self.original_name = self.file.name
        super().save(*args, **kwargs)


class YoutubeEmbed(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='youtube_embeds')
    video_id = models.CharField(max_length=32)
    title = models.CharField(max_length=255, blank=True)
    thumbnail_url = models.URLField(blank=True)

    class Meta:
        unique_together = ('post', 'video_id')


class BoardAccess(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="access_rules")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="board_accesses")
    can_view = models.BooleanField(default=True)

    class Meta:
        unique_together = ("board", "user")
        verbose_name = "Board Access"
        verbose_name_plural = "Board Accesses"

    def __str__(self) -> str:
        return f"{self.user} -> {self.board}"

