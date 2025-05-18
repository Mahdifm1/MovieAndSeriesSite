from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('browse/', BrowseView.as_view(), name='brows_page'),
]
