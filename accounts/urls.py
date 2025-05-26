# accounts/urls.py
from django.urls import path
from . import views # ویوهای خودتان را import کنید
from django.contrib.auth import views as auth_views # ویوهای داخلی جنگو

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # change password
    path('password_change/', auth_views.PasswordChangeView.as_view(template_name='accounts/password_change_form.html', success_url=views.password_change_done_view), name='password_change'), # success_url را می‌توانید به یک URL name تغییر دهید
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='accounts/password_change_done.html'), name='password_change_done'),

    # password reset
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='accounts/password_reset_form.html', email_template_name='accounts/password_reset_email.html', subject_template_name='accounts/password_reset_subject.txt', success_url=views.password_reset_done_view), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='accounts/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='accounts/password_reset_confirm.html', success_url=views.password_reset_complete_view), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='accounts/password_reset_complete.html'), name='password_reset_complete'),

    # user profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.profile_edit_view, name='profile_edit'),
]