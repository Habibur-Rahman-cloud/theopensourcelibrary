from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags
from .models import Book, Newsletter

@receiver(post_save, sender=Book)
def notify_subscribers_on_new_book(sender, instance, created, **kwargs):
    if created:
        # Fetch all verified subscribers
        subscribers = Newsletter.objects.filter(is_verified=True)
        if not subscribers.exists():
            return

        subject = f"New Book Alert: {instance.title} 📖"
        
        # Public site URL (set FRONTEND_URL on Railway / in .env)
        site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        book_url = f"{site_url}/#new" # Directing to latest section

        html_content = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0;">
            <div style="max-w-md: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
                <h1 style="color: #18181b; font-size: 24px; font-weight: 800; margin-bottom: 8px;">The Opensource Library</h1>
                <p style="color: #3b82f6; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 32px;">New Arrival Notice</p>
                
                <div style="margin-bottom: 32px; padding: 0 20px;">
                    <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 12px;">{instance.title}</h2>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        {instance.summary}
                    </p>
                    
                    <a href="{book_url}" style="background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);">
                        Read Book Details
                    </a>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">
                    You are receiving this because you subscribed to The Opensource Library newsletter.
                </p>
            </div>
        </body>
        </html>
        """
        text_content = strip_tags(html_content)
        
        # Send to all subscribers using a loop
        # (For production, this should be moved to a background task like Celery)
        recipient_list = [sub.email for sub in subscribers]
        
        msg = EmailMultiAlternatives(
            subject, 
            text_content, 
            settings.DEFAULT_FROM_EMAIL, 
            bcc=recipient_list # Using bcc for efficiency in a single call
        )
        msg.attach_alternative(html_content, "text/html")
        
        try:
            msg.send(fail_silently=False)
            print(f"Announcement email sent for '{instance.title}' to {len(recipient_list)} subscribers.")
        except Exception as e:
            print(f"Failed to send newsletter announcement: {str(e)}")
