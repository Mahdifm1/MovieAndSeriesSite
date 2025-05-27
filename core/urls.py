from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home_page'),
    path('browse/', BrowseView.as_view(), name='browse_page'),
    path('actors/', SearchActorsView.as_view(), name='actors_page'),
    path('api/ai-search/', AiDiscoveryView.as_view(), name='ai_discovery_page'),
    path('movies/<int:movie_id>/', MovieDetailView.as_view(), name='movie_detail'),
    path('series/<int:series_id>/', SeriesDetailView.as_view(), name='series_detail'),
    path('actors/<int:actor_id>/', ActorDetailView.as_view(), name='actor_detail'),
    path('api/toggle-like/', ToggleLikeView.as_view(), name='toggle_like'),
    path('api/toggle-watchlist/', ToggleWatchlistView.as_view(), name='toggle_watchlist'),
]
