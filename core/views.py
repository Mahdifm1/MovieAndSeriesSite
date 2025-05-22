import json.decoder

from django.shortcuts import render
from django.views.generic import View
from django.conf import settings
import redis

redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


class HomeView(View):
    def get(self, request):
        context = {}

        context['latest_movies'] = redis_client.get('latest_movies').decode('utf-8')
        print(context.get('latest_movies'))

        return render(request, 'core/home_page.html', context)


class BrowseView(View):
    def get(self, request):

        return render(request, 'core/browse.html')