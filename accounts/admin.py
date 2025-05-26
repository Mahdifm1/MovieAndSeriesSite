from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.models import CustomUser


# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     fieldsets = ('username', 'email', 'password', 'first_name', 'last_name', 'is_active')
#
#
# admin.site.register(CustomUser, CustomUserAdmin)
