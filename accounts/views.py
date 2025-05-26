from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.contrib.auth.views import LoginView, PasswordChangeDoneView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from .forms import CustomUserCreationForm, CustomUserChangeForm, CustomAuthenticationForm
from .models import CustomUser
from .tasks import send_verification_email_task


class CustomLoginView(LoginView):
    form_class = CustomAuthenticationForm
    template_name = 'accounts/login.html'


class CustomPasswordChangeDoneView(LoginRequiredMixin, PasswordChangeDoneView):
    template_name = 'accounts/password_change_done.html'
    
    def dispatch(self, request, *args, **kwargs):
        # Check if user came from password change page
        referer = request.META.get('HTTP_REFERER', '')
        if not referer or 'password/change' not in referer:
            messages.error(request, "Access denied. Please use the password change form.")
            return redirect('accounts:profile')
        return super().dispatch(request, *args, **kwargs)


def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Send verification email
            send_verification_email(request, user)
            return redirect('home_page')
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/signup.html', {'form': form})


@login_required
def profile_view(request):
    return render(request, 'accounts/profile.html', {'user_profile': request.user})


@login_required
def profile_edit_view(request):
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            # Get the new email from the form
            new_email = form.cleaned_data.get('email')
            
            # Check if email has changed
            if new_email != request.user.email:
                # If the current email was verified, set it to unverified
                if request.user.is_email_verified:
                    request.user.is_email_verified = False
                    messages.info(request, "Your email has been changed. Please verify your new email address.")
                
                # Save the user with the new email
                user = form.save()
                
                # Send verification email for the new address
                send_verification_email(request, user)
                messages.success(request, "Profile updated successfully. A verification email has been sent to your new email address.")
            else:
                # If email hasn't changed, just save the form
                form.save()
                messages.success(request, "Profile updated successfully.")
            
            return redirect('accounts:profile')
    else:
        form = CustomUserChangeForm(instance=request.user)
    return render(request, 'accounts/profile_edit.html', {'form': form})


@login_required
def resend_verification_view(request):
    if request.method == 'POST':
        user = request.user
        if not user.is_email_verified:
            send_verification_email(request, user)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'already_verified'})
    return JsonResponse({'status': 'error'}, status=400)


def verify_email_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_email_verified = True
        user.save()
        messages.success(request, "Your email has been verified successfully!")
        return render(request, 'accounts/email_verification_success.html')
    else:
        messages.error(request, "Email verification failed. Please try again.")
        return render(request, 'accounts/email_verification_failed.html')


def send_verification_email(request, user):
    """
    Prepare and queue verification email using Celery.
    
    Args:
        request: The HTTP request object
        user: The user object to send verification email to
    """
    # Generate verification token and URL
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_url = request.build_absolute_uri(
        reverse_lazy('accounts:verify_email', kwargs={'uidb64': uid, 'token': token})
    )
    
    # Prepare email content
    subject = 'Verify your email address'
    context = {
        'user': user,
        'verification_url': verification_url,
    }
    html_message = render_to_string('accounts/email_verification.html', context)
    plain_message = f'Click the following link to verify your email: {verification_url}'
    
    try:
        # Queue the email sending task
        send_verification_email_task.delay(
            email=user.email,
            subject=subject,
            html_message=html_message,
            plain_message=plain_message
        )
    except Exception as e:
        print(f"Failed to queue verification email: {e}")
        messages.error(request, "Failed to send verification email. Please try again later.")


password_change_done_view = reverse_lazy('accounts:password_change_done')
password_reset_done_view = reverse_lazy('accounts:password_reset_done')
password_reset_complete_view = reverse_lazy('accounts:password_reset_complete')
