import json
from pprint import pprint

from django.shortcuts import render
from django.views.generic import View
from django.conf import settings
import redis

redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


class HomeView(View):
    def get(self, request):
        context = {}
        context['latest_movies'] = sorted(json.loads(redis_client.get('latest_movies').decode('utf-8')),
                                          key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        context['latest_series'] = sorted(json.loads(redis_client.get('latest_series').decode('utf-8')),
                                          key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        context['trending_now'] = json.loads(redis_client.get('trending_movies_and_series'))[:10]
        pprint(context.get('latest_series'))

        return render(request, 'core/home_page.html', context)


class BrowseView(View):
    def get(self, request):
        return render(request, 'core/browse.html')
