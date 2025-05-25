import ast
import json
import redis
import asyncio
import aiohttp

from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import View
from django.conf import settings

from .tmdp_api import get_filtered_movies_and_series_list, get_filtered_actors_list, get_trending_actors_list, \
    search_tmdb_item_details_async
from .ai_api import send_prompt_to_ai

redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


class HomeView(View):
    def get(self, request):
        context = {}
        context['latest_movies'] = sorted(json.loads(redis_client.get('latest_movies').decode('utf-8')),
                                          key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        context['latest_series'] = sorted(json.loads(redis_client.get('latest_series').decode('utf-8')),
                                          key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        context['trending_now'] = json.loads(redis_client.get('trending_movies_and_series'))[:10]

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

        filtered_movie_and_series_list = get_filtered_movies_and_series_list(**cleaned_query_params)
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
                context['current_query_params'] = context['current_query_params'][index + 1:]

        return render(request, 'core/browse.html', context)


class SearchActorsView(View):
    def get(self, request):
        context = {}

        actor_name = request.GET.get('name').strip() if request.GET.get('name') else None
        page = request.GET.get('page').strip() if request.GET.get('page') else '1'

        if actor_name:
            filtered_actors_list = get_filtered_actors_list(name=actor_name, page=page)
        else:
            filtered_actors_list = get_trending_actors_list(page=page)

        context['actors_list'] = filtered_actors_list.get('results', [])

        # get pagination
        context['current_page'] = filtered_actors_list.get('current_page', 1)
        context['total_pages'] = filtered_actors_list.get('total_pages', 1)
        context['total_results'] = filtered_actors_list.get('total_results', 0)
        context['page_numbers'] = range(1, filtered_actors_list.get('total_pages', 1) + 1)

        context['current_query_params'] = request.GET.urlencode()
        if context['current_query_params'].startswith('page='):
            index = context['current_query_params'].find('&')
            if index == -1:
                context['current_query_params'] = ''
            else:
                context['current_query_params'] = context['current_query_params'][index + 1:]

        return render(request, 'core/actors.html', context=context)


class AiDiscoveryView(View):
    async def post(self, request):
        if request.content_type != 'application/json':
            return JsonResponse({"error": "Invalid Content-Type. Expected application/json."}, status=415)

        try:
            prompt = json.loads(request.body.decode('utf-8')).get('prompt')
            print(f"Received prompt from user: {prompt}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)

        if not prompt or not isinstance(prompt, str) or not prompt.strip():
            return JsonResponse({"error": "Invalid input. Expected JSON string."}, status=400)

        ai_response_string = send_prompt_to_ai(prompt.strip())
        print(f"Raw response from AI: {ai_response_string}")

        if not ai_response_string:
            return JsonResponse({"error": "Failed to get response from AI. Please try again later."}, status=502)

        try:
            ai_suggestions_dict = ast.literal_eval(ai_response_string.strip())
            if not isinstance(ai_suggestions_dict, dict):
                raise ValueError("AI response was not a dictionary after parsing.")
            print(f"Parsed AI suggestions: {ai_suggestions_dict}")  # لاگ کردن دیکشنری پارس شده
        except (ValueError, SyntaxError) as e:
            print(f"Error converting AI response string to dictionary: {e}")
            print(f"AI response string was: {ai_response_string}")
            return JsonResponse({"error": "AI response format was invalid. Could not parse the suggestions."},
                                status=502)

        movie_titles_from_ai = ai_suggestions_dict.get('movies', [])
        series_titles_from_ai = ai_suggestions_dict.get('series', [])

        # make sure we only get 5 item for each movies and series
        movie_titles_from_ai = movie_titles_from_ai[:5] if isinstance(movie_titles_from_ai, list) else []
        series_titles_from_ai = series_titles_from_ai[:5] if isinstance(series_titles_from_ai, list) else []

        async with aiohttp.ClientSession() as session:
            movie_tasks = []
            for title in movie_titles_from_ai:
                if isinstance(title, str) and title.strip():
                    movie_tasks.append(search_tmdb_item_details_async(session, title.strip(), "movie"))

            series_tasks = []
            for title in series_titles_from_ai:
                if isinstance(title, str) and title.strip():
                    series_tasks.append(search_tmdb_item_details_async(session, title.strip(), "tv"))

            movie_results = await asyncio.gather(*movie_tasks)
            series_results = await asyncio.gather(*series_tasks)

            movies_data = [res for res in movie_results if res is not None]
            shows_data = [res for res in series_results if res is not None]

        final_response = {"movies": movies_data, "shows": shows_data}

        return JsonResponse(final_response)
