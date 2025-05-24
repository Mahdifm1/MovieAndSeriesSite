from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home_page'),
    path('browse/', BrowseView.as_view(), name='brows_page'),
    path('actors/', SearchActorsView.as_view(), name='actors_page'),
]
