from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Book, Newsletter, RequestedBook

class BookInline(admin.TabularInline):
    model = Book
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_emoji', 'book_count', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    
    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = "N° of Books"

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'cover_preview', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'summary', 'description')
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ('category',)
    
    fieldsets = (
        ('General Info', {
            'fields': (('title', 'slug'), 'category')
        }),
        ('Files', {
            'fields': ('cover_image', 'pdf_file')
        }),
        ('Content', {
            'fields': ('summary', 'description')
        }),
    )

    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.cover_image.url)
        return "No image"
    cover_preview.short_description = 'Cover'

@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_verified', 'otp', 'subscribed_at')
    list_filter = ('is_verified', 'subscribed_at')
    search_fields = ('email',)
    ordering = ('-subscribed_at',)


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
