from django.db import models
from django.conf import settings

# Create your models here.

class UserLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    item_id = models.IntegerField()
    item_type = models.CharField(max_length=10, choices=[('movie', 'Movie'), ('tv', 'TV Series')])
    item_title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item_id', 'item_type')

class UserWatchlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watchlist')
    item_id = models.IntegerField()
    item_type = models.CharField(max_length=10, choices=[('movie', 'Movie'), ('tv', 'TV Series')])
    item_title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item_id', 'item_type')

class AIRecommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_recommendations')
    item_id = models.IntegerField()
    item_type = models.CharField(max_length=10, choices=[('movie', 'Movie'), ('tv', 'TV Series')])
    item_title = models.CharField(max_length=255)
    poster_path = models.URLField(max_length=500, null=True, blank=True)
    tmdb_rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'item_id', 'item_type')
        ordering = ['-created_at']
