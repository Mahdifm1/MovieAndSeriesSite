from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from unittest.mock import patch
from .forms import CustomUserCreationForm, CustomUserChangeForm, CustomAuthenticationForm
from .tasks import send_verification_email_task
from django.conf import settings

User = get_user_model()

class CustomUserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_creation(self):
        """Test user creation with all fields"""
        self.assertEqual(self.user.username, self.user_data['username'])
        self.assertEqual(self.user.email, self.user_data['email'])
        self.assertEqual(self.user.first_name, self.user_data['first_name'])
        self.assertEqual(self.user.last_name, self.user_data['last_name'])
        self.assertFalse(self.user.is_email_verified)

    def test_user_str_method(self):
        """Test the string representation of user"""
        expected_str = f"{self.user.first_name} {self.user.last_name}"
        self.assertEqual(str(self.user), expected_str)

        # Test without first and last name
        user2 = User.objects.create_user(username='testuser2', email='test2@example.com', password='testpass123')
        self.assertEqual(str(user2), user2.username)


class AccountFormsTests(TestCase):
    def test_custom_user_creation_form(self):
        """Test CustomUserCreationForm validation"""
        form_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        form = CustomUserCreationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_custom_user_change_form(self):
        """Test CustomUserChangeForm validation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        form_data = {
            'email': 'newemail@example.com',
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        form = CustomUserChangeForm(data=form_data, instance=user)
        self.assertTrue(form.is_valid())

    def test_custom_authentication_form(self):
        """Test CustomAuthenticationForm validation"""
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        form_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        form = CustomAuthenticationForm(data=form_data)
        self.assertTrue(form.is_valid())


class AccountViewsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_signup_view(self):
        """Test signup view functionality"""
        url = reverse('accounts:signup')
        
        # Test GET request
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'accounts/signup.html')

        # Test POST request
        new_user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, new_user_data)
        self.assertEqual(response.status_code, 302)  # Redirect after successful signup
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_view(self):
        """Test login view functionality"""
        url = reverse('accounts:login')
        
        # Test GET request
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'accounts/login.html')

        # Test POST request
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful login

    def test_profile_view(self):
        """Test profile view functionality"""
        url = reverse('accounts:profile')
        
        # Test unauthenticated access
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)  # Redirect to login

        # Test authenticated access
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'accounts/profile.html')

    def test_profile_edit_view(self):
        """Test profile edit functionality"""
        url = reverse('accounts:profile_edit')
        self.client.login(username='testuser', password='testpass123')

        # Test GET request
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'accounts/profile_edit.html')

        # Test POST request with email change
        new_data = {
            'email': 'newemail@example.com',
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.post(url, new_data)
        self.assertEqual(response.status_code, 302)  # Redirect after successful edit
        
        # Verify changes
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'newemail@example.com')
        self.assertEqual(user.first_name, 'Updated')
        self.assertFalse(user.is_email_verified)

    @patch('accounts.tasks.send_verification_email_task.delay')
    def test_email_verification_flow(self, mock_task):
        """Test complete email verification flow"""
        # Test sending verification email
        self.client.login(username='testuser', password='testpass123')
        url = reverse('accounts:resend_verification')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        mock_task.assert_called_once()

        # Test verification link
        user = User.objects.get(username='testuser')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = reverse('accounts:verify_email', kwargs={'uidb64': uid, 'token': token})
        
        response = self.client.get(verify_url)
        self.assertEqual(response.status_code, 200)
        
        # Verify user's email is now verified
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

    def test_password_change_flow(self):
        """Test password change functionality"""
        self.client.login(username='testuser', password='testpass123')
        
        # Test password change
        url = reverse('accounts:password_change')
        response = self.client.post(url, {
            'old_password': 'testpass123',
            'new_password1': 'newtestpass123',
            'new_password2': 'newtestpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect to success page

        # Verify password change
        self.assertTrue(
            self.client.login(username='testuser', password='newtestpass123')
        )

    def test_password_reset_flow(self):
        """Test password reset functionality"""
        # Request password reset
        url = reverse('accounts:password_reset')
        response = self.client.post(url, {'email': 'test@example.com'})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(len(mail.outbox), 1)

        # Get the reset link from the email
        email_content = mail.outbox[0].body
        reset_link = [l for l in email_content.split('\n') if 'reset' in l][0]
        
        # Use the reset link
        response = self.client.get(reset_link)
        self.assertEqual(response.status_code, 200)

        # Set new password
        response = self.client.post(reset_link, {
            'new_password1': 'newtestpass123',
            'new_password2': 'newtestpass123'
        })
        self.assertEqual(response.status_code, 302)

        # Verify new password works
        self.assertTrue(
            self.client.login(username='testuser', password='newtestpass123')
        )


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class CeleryTasksTests(TestCase):
    """Test Celery tasks"""
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    @patch('django.core.mail.send_mail')
    def test_send_verification_email_task(self, mock_send_mail):
        """Test the email verification task"""
        # Setup test data
        email = 'test@example.com'
        subject = 'Test Subject'
        html_message = '<p>Test message</p>'
        plain_message = 'Test message'

        # Execute task
        result = send_verification_email_task.delay(
            email=email,
            subject=subject,
            html_message=html_message,
            plain_message=plain_message
        )

        # Verify task execution
        self.assertTrue(result.successful())
        mock_send_mail.assert_called_once_with(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False
        )

    @patch('django.core.mail.send_mail')
    def test_send_verification_email_task_retry(self, mock_send_mail):
        """Test task retry mechanism"""
        mock_send_mail.side_effect = Exception('Test error')

        with self.assertRaises(Exception):
            send_verification_email_task.delay(
                email='test@example.com',
                subject='Test',
                html_message='Test',
                plain_message='Test'
            )
