from __future__ import annotations

import re
from typing import Iterable

from rest_framework import serializers

from .models import Attachment, Board, Post, YoutubeEmbed

YOUTUBE_REGEX = re.compile(r"(?:v=|youtu\.be/|embed/)([A-Za-z0-9_-]{11})")


def extract_video_id(url: str) -> str | None:
    match = YOUTUBE_REGEX.search(url)
    if match:
        return match.group(1)
    return None


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'original_name', 'mime_type', 'file_size']
        read_only_fields = ['id', 'file_size']


class YoutubeEmbedSerializer(serializers.ModelSerializer):
    class Meta:
        model = YoutubeEmbed
        fields = ['id', 'video_id', 'title', 'thumbnail_url']
        read_only_fields = ['id']


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'visibility']


class PostSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    youtube_embeds = YoutubeEmbedSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'board',
            'author',
            'author_name',
            'author_email',
            'title',
            'content',
            'view_type',
            'created_at',
            'updated_at',
            'attachments',
            'youtube_embeds',
        ]
        read_only_fields = ['id', 'board', 'author', 'author_name', 'author_email', 'created_at', 'updated_at', 'attachments', 'youtube_embeds']

    def get_author_name(self, obj: Post):
        if obj.author and obj.author.first_name:
            return obj.author.first_name
        if obj.author and obj.author.email:
            return obj.author.email
        return 'admin@shashoo.com'

    def get_author_email(self, obj: Post):
        if obj.author and obj.author.email:
            return obj.author.email
        return 'admin@shashoo.com'


class PostWriteSerializer(PostSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(max_length=1024 * 1024 * 50),
        allow_empty=True,
        required=False,
        write_only=True,
    )
    youtube_links = serializers.ListField(
        child=serializers.URLField(), allow_empty=True, required=False, write_only=True
    )

    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['attachments', 'youtube_links']

    def create(self, validated_data: dict):
        attachments_data: Iterable = validated_data.pop('attachments', [])
        youtube_links: Iterable[str] = validated_data.pop('youtube_links', [])
        request = self.context['request']
        post = Post.objects.create(author=request.user, **validated_data)

        for uploaded in attachments_data:
            Attachment.objects.create(
                post=post,
                file=uploaded,
                original_name=getattr(uploaded, 'name', ''),
                mime_type=getattr(uploaded, 'content_type', ''),
                file_size=uploaded.size,
            )

        for link in youtube_links:
            video_id = extract_video_id(link)
            if video_id:
                YoutubeEmbed.objects.get_or_create(post=post, video_id=video_id)
        return post

    def update(self, instance: Post, validated_data: dict):
        attachments_data: Iterable = validated_data.pop('attachments', [])
        youtube_links: Iterable[str] = validated_data.pop('youtube_links', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        for uploaded in attachments_data:
            Attachment.objects.create(
                post=instance,
                file=uploaded,
                original_name=getattr(uploaded, 'name', ''),
                mime_type=getattr(uploaded, 'content_type', ''),
                file_size=uploaded.size,
            )

        if youtube_links:
            instance.youtube_embeds.all().delete()
            for link in youtube_links:
                video_id = extract_video_id(link)
                if video_id:
                    YoutubeEmbed.objects.get_or_create(post=instance, video_id=video_id)
        return instance



class BoardSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'visibility']


class BoardAccessUpdateSerializer(serializers.Serializer):
    userId = serializers.IntegerField()
    boardIds = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)



