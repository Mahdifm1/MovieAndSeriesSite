from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


@shared_task(
    name="send_verification_email_task",
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 5},
    retry_backoff=True
)
def send_verification_email_task(email, subject, html_message, plain_message):
    """
    Celery task to send verification email.
    
    Args:
        email (str): Recipient email address
        subject (str): Email subject
        html_message (str): HTML version of the email
        plain_message (str): Plain text version of the email
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Re-raise the exception for Celery's retry mechanism
        raise 