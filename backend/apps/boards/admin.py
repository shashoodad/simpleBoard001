from django.contrib import admin

from .models import Attachment, Board, BoardAccess, Post, YoutubeEmbed


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'visibility')
    list_filter = ('visibility',)
    search_fields = ('name',)


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0


class YoutubeInline(admin.TabularInline):
    model = YoutubeEmbed
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'board', 'author', 'view_type', 'created_at')
    list_filter = ('board', 'view_type')
    search_fields = ('title', 'content')
    inlines = [AttachmentInline, YoutubeInline]


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'post', 'file_size')
    search_fields = ('original_name',)


@admin.register(YoutubeEmbed)
class YoutubeEmbedAdmin(admin.ModelAdmin):
    list_display = ('video_id', 'post')
    search_fields = ('video_id',)


@admin.register(BoardAccess)
class BoardAccessAdmin(admin.ModelAdmin):
    list_display = ("board", "user", "can_view")
    list_filter = ("can_view", "board")
    search_fields = ("board__name", "user__email")

