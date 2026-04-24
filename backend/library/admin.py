from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count

from .models import Category, Tag, Book, Newsletter, RequestedBook


# ─────────────────────────────────────────────────────────────────────────────
# Category Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('hierarchy_name', 'icon_emoji', 'parent', 'book_count', 'slug', 'is_sub_badge')
    list_filter = ('parent',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('parent',)
    list_select_related = ('parent',)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _book_count=Count('books', distinct=True)
        ).select_related('parent')

    def hierarchy_name(self, obj):
        """Shows indented name for sub-categories."""
        if obj.parent:
            return format_html(
                '<span style="padding-left:18px; color:#6c757d;">↳</span> {}',
                obj.name
            )
        return format_html('<strong>{}</strong>', obj.name)
    hierarchy_name.short_description = 'Category'
    hierarchy_name.admin_order_field = 'name'

    def book_count(self, obj):
        count = obj._book_count
        if count == 0:
            return format_html('<span style="color:#adb5bd;">0</span>')
        return format_html(
            '<span style="background:#198754;color:white;padding:2px 8px;border-radius:10px;">{}</span>',
            count
        )
    book_count.short_description = 'Books'
    book_count.admin_order_field = '_book_count'

    def is_sub_badge(self, obj):
        if obj.parent:
            return format_html(
                '<span style="background:#0d6efd;color:white;padding:2px 8px;'
                'border-radius:10px;font-size:11px;">Sub-category</span>'
            )
        return format_html(
            '<span style="background:#6c757d;color:white;padding:2px 8px;'
            'border-radius:10px;font-size:11px;">Top-level</span>'
        )
    is_sub_badge.short_description = 'Level'


# ─────────────────────────────────────────────────────────────────────────────
# Tag Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'book_count', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _book_count=Count('books', distinct=True)
        )

    def book_count(self, obj):
        count = obj._book_count
        if count == 0:
            return format_html('<span style="color:#adb5bd;">0</span>')
        return format_html(
            '<span style="background:#0dcaf0;color:#000;padding:2px 8px;border-radius:10px;">{}</span>',
            count
        )
    book_count.short_description = 'Books'
    book_count.admin_order_field = '_book_count'


# ─────────────────────────────────────────────────────────────────────────────
# Book Admin
# ─────────────────────────────────────────────────────────────────────────────

# Inline SEO preview — injected as a read-only field with custom HTML+JS
SEO_PREVIEW_JS = """
<style>
.seo-preview-box {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 16px 20px;
    max-width: 600px;
    font-family: Arial, sans-serif;
    background: #fff;
    margin-top: 8px;
}
.seo-preview-url {
    color: #006621;
    font-size: 13px;
    margin: 4px 0;
    word-break: break-all;
}
.seo-preview-title {
    color: #1a0dab;
    font-size: 18px;
    font-weight: normal;
    margin: 0 0 2px;
    text-decoration: underline;
    cursor: pointer;
}
.seo-preview-description {
    color: #545454;
    font-size: 13px;
    line-height: 1.5;
    margin: 4px 0 0;
}
.seo-char-counter {
    font-size: 12px;
    color: #6c757d;
    margin-top: 6px;
}
.seo-char-counter span.ok { color: #198754; }
.seo-char-counter span.warn { color: #ffc107; }
.seo-char-counter span.over { color: #dc3545; }
</style>

<div class="seo-preview-box">
  <div style="color:#5f6368; font-size:12px; margin-bottom:8px;">
    🔍 <strong>Google Search Preview</strong>
  </div>
  <div class="seo-preview-title" id="seo-prev-title">Loading...</div>
  <div class="seo-preview-url" id="seo-prev-url">https://theopensourcelibrary.com/books/<span id="seo-slug-part"></span></div>
  <div class="seo-preview-description" id="seo-prev-desc">Loading...</div>
</div>

<div class="seo-char-counter">
  Meta Title: <span id="seo-title-count">0</span>/70 chars &nbsp;|&nbsp;
  Meta Description: <span id="seo-desc-count">0</span>/160 chars
</div>

<script>
(function() {
    function colorCount(el, val, max) {
        el.className = val === 0 ? '' : val <= max * 0.85 ? 'ok' : val <= max ? 'warn' : 'over';
        el.textContent = val;
    }

    function update() {
        var titleField = document.getElementById('id_meta_title');
        var descField  = document.getElementById('id_meta_description');
        var slugField  = document.getElementById('id_slug');
        var bookTitle  = document.getElementById('id_title');

        var title = (titleField && titleField.value.trim()) ||
                    (bookTitle  && bookTitle.value.trim())  || '(No title yet)';
        var desc  = (descField  && descField.value.trim())  || '(No description yet)';
        var slug  = (slugField  && slugField.value.trim())  || '...';

        document.getElementById('seo-prev-title').textContent = title;
        document.getElementById('seo-prev-desc').textContent  = desc;
        document.getElementById('seo-slug-part').textContent  = slug;

        var titleCount = document.getElementById('seo-title-count');
        var descCount  = document.getElementById('seo-desc-count');

        var titleLen = titleField ? titleField.value.length : 0;
        var descLen  = descField  ? descField.value.length  : 0;

        colorCount(titleCount, titleLen, 70);
        colorCount(descCount,  descLen, 160);
    }

    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        update();
        ['id_meta_title', 'id_meta_description', 'id_slug', 'id_title'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    });
})();
</script>
"""


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'cover_preview', 'title', 'author', 'category_tags',
        'tag_count', 'seo_score', 'created_at'
    )
    list_filter = ('categories', 'created_at', 'tags')
    search_fields = ('title', 'author', 'summary', 'description', 'meta_title', 'meta_description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('categories', 'tags')
    readonly_fields = ('created_at', 'updated_at', 'seo_preview_panel')

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related(
            'categories', 'tags'
        ).select_related('category').annotate(
            _tag_count=Count('tags', distinct=True)
        )

    fieldsets = (
        ('📖 General Info', {
            'fields': (
                ('title', 'slug'),
                ('author', 'published_year'),
            )
        }),
        ('🔍 SEO Settings', {
            'description': (
                'These fields control how this book appears in Google search results. '
                'Fill them carefully — they directly affect your search rankings.'
            ),
            'fields': (
                'meta_title',
                'meta_description',
                'seo_preview_panel',
            )
        }),
        ('📂 Categories', {
            'description': (
                'Select one or more categories. Use the arrows to move categories '
                'between the Available and Chosen lists.'
            ),
            'fields': ('categories',)
        }),
        ('🏷️ SEO Tags / Keywords', {
            'description': (
                'Add keyword tags that people would search to find this book. '
                'Example: "atomic habits summary", "james clear", "habit building tips"'
            ),
            'fields': ('tags',)
        }),
        ('📁 Files', {
            'fields': ('cover_image', 'pdf_file')
        }),
        ('📝 Content', {
            'fields': ('summary', 'description')
        }),
        ('🕐 Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )

    def seo_preview_panel(self, obj):
        return format_html(SEO_PREVIEW_JS)
    seo_preview_panel.short_description = 'Live Google Preview'
    seo_preview_panel.allow_tags = True

    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="width:48px;height:64px;object-fit:cover;'
                'border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.25);" />',
                obj.cover_image.url
            )
        return format_html('<span style="color:#adb5bd;">No image</span>')
    cover_preview.short_description = 'Cover'

    def category_tags(self, obj):
        cats = obj.categories.all()
        if not cats:
            return format_html('<span style="color:#adb5bd;">—</span>')
        badges = []
        colors = ['#0d6efd', '#6610f2', '#198754', '#dc3545', '#fd7e14', '#20c997']
        for i, cat in enumerate(cats):
            color = colors[i % len(colors)]
            badge = (
                f'<span style="background:{color};color:white;padding:2px 7px;'
                f'border-radius:10px;font-size:11px;margin-right:3px;">{cat.name}</span>'
            )
            badges.append(badge)
        return format_html(''.join(badges))
    category_tags.short_description = 'Categories'

    def tag_count(self, obj):
        count = obj._tag_count
        if count == 0:
            return format_html('<span style="color:#adb5bd;">0 tags</span>')
        return format_html(
            '<span style="background:#0dcaf0;color:#000;padding:2px 8px;border-radius:10px;">'
            '🏷️ {}</span>',
            count
        )
    tag_count.short_description = 'Tags'
    tag_count.admin_order_field = '_tag_count'

    def seo_score(self, obj):
        """
        Simple visual SEO score based on whether meta_title and
        meta_description are filled, and if they're within char limits.
        """
        score = 0
        tips = []

        if obj.meta_title:
            if len(obj.meta_title) <= 70:
                score += 40
            else:
                tips.append('Title > 70 chars')
        else:
            tips.append('Missing meta title')

        if obj.meta_description:
            if len(obj.meta_description) <= 160:
                score += 40
            else:
                tips.append('Description > 160 chars')
        else:
            tips.append('Missing meta description')

        if obj.tags.exists():
            score += 20

        if score >= 80:
            color = '#198754'
            label = f'✅ {score}%'
        elif score >= 40:
            color = '#ffc107'
            label = f'⚠️ {score}%'
        else:
            color = '#dc3545'
            label = f'❌ {score}%'

        title = ' | '.join(tips) if tips else 'All good!'
        return format_html(
            '<span style="color:{};font-weight:600;" title="{}">{}</span>',
            color, title, label
        )
    seo_score.short_description = 'SEO'


# ─────────────────────────────────────────────────────────────────────────────
# Newsletter Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_verified', 'otp', 'subscribed_at')
    list_filter = ('is_verified', 'subscribed_at')
    search_fields = ('email',)
    ordering = ('-subscribed_at',)


# ─────────────────────────────────────────────────────────────────────────────
# Requested Book Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(RequestedBook)
class RequestedBookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_name', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ('status',)
    search_fields = ('title', 'author_name', 'email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Request', {'fields': ('title', 'author_name', 'email')}),
        ('Review', {'fields': ('status', 'created_at')}),
    )
