import json
from pprint import pprint

from django.shortcuts import render
from django.views.generic import View
from django.conf import settings
import redis

from core.tmdp import get_filtered_movies_and_series

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
        context = {}
        query_params = request.GET
        cleaned_query_params = {}
        for key, value in query_params.items():
            value = value.strip()
            if key == "actor":
                if not value:
                    value = None
                cleaned_query_params['actor'] = value
            if key == "v_type":
                if value not in ['tv', 'movie']:
                    value = 'movie'
                cleaned_query_params['v_type'] = value

            if key == "year":
                if value not in ['all', '2025', '2024', '2023', '2022', '2021', '2020', 'older']:
                    value = 'all'
                cleaned_query_params['year'] = value
            if key == "genre":
                cleaned_query_params['genre'] = value
            if key == "rating":
                if value not in ['all', '5', '6', '7', '8', '9']:
                    value = 'all'
                cleaned_query_params['rating'] = value
            if key == "page":
                if int(value) > 0:
                    cleaned_query_params['page'] = value
        context["query_params"] = cleaned_query_params

        filtered_movie_and_series_list = get_filtered_movies_and_series(**cleaned_query_params)
        context['filtered_movie_and_series_list'] = filtered_movie_and_series_list.get('results', [])

        # get pagination
        context['current_page'] = filtered_movie_and_series_list.get('current_page', 1)
        context['total_pages'] = filtered_movie_and_series_list.get('total_pages', 1)
        context['total_results'] = filtered_movie_and_series_list.get('total_results', 0)
        context['page_numbers'] = range(1, filtered_movie_and_series_list.get('total_pages', 1) + 1)

        # get query params
        context['current_query_params'] = query_params.urlencode()
        if context['current_query_params'].startswith('page='):
            index = context['current_query_params'].find('&')
            if index == -1:
                context['current_query_params'] = ''
            else:
                context['current_query_params'] = context['current_query_params'][index+1:]

        return render(request, 'core/browse.html', context)
