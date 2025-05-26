# accounts/urls.py
from django.urls import path
from . import views # ویوهای خودتان را import کنید
from django.contrib.auth import views as auth_views # ویوهای داخلی جنگو

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home_page'), name='logout'),

    # change password
    path('password/change/', 
        auth_views.PasswordChangeView.as_view(
            template_name='accounts/password_change_form.html',
            success_url='done/'
        ), 
        name='password_change'
    ),
    path('password/change/done/',
        views.CustomPasswordChangeDoneView.as_view(),
        name='password_change_done'
    ),

    # password reset
    path('password/reset/',
        auth_views.PasswordResetView.as_view(
            template_name='accounts/password_reset_form.html',
            email_template_name='accounts/password_reset_email.html',
            subject_template_name='accounts/password_reset_subject.txt',
            success_url='done/'
        ),
        name='password_reset'
    ),
    path('password/reset/done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='accounts/password_reset_done.html'
        ),
        name='password_reset_done'
    ),
    path('password/reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='accounts/password_reset_confirm.html',
            success_url='../complete/'
        ),
        name='password_reset_confirm'
    ),
    path('password/reset/complete/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='accounts/password_reset_complete.html'
        ),
        name='password_reset_complete'
    ),

    # user profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.profile_edit_view, name='profile_edit'),

    # email verification
    path('resend-verification/', views.resend_verification_view, name='resend_verification'),
    path('verify-email/<str:uidb64>/<str:token>/', views.verify_email_view, name='verify_email'),
]