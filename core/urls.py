from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home_page'),
    path('browse/', BrowseView.as_view(), name='browse_page'),
    path('actors/', SearchActorsView.as_view(), name='actors_page'),
    path('api/ai-search/', AiDiscoveryView.as_view(), name='ai_discovery_page'),
]
