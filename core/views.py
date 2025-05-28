import ast
import json
import redis
import asyncio
import aiohttp

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse

from .tmbd_api import get_filtered_movies_and_series_list, get_filtered_actors_list, get_trending_actors_list, \
    search_tmdb_item_details_async, get_movie_details, get_tv_details, get_actor_details
from .ai_api import send_prompt_to_ai
from .models import UserLike, UserWatchlist, AIRecommendation
from .tasks import update_ai_recommendations

redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


class HomeView(View):
    def get(self, request):
        context = {}
        # Get latest movies and series
        context['latest_movies'] = sorted(json.loads(redis_client.get('latest_movies').decode('utf-8')),
                                        key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        context['latest_series'] = sorted(json.loads(redis_client.get('latest_series').decode('utf-8')),
                                        key=lambda d: d['tmdb_rating'], reverse=True)[:5]
        
        # Get trending items and normalize their media_type
        trending_items = json.loads(redis_client.get('trending_movies_and_series'))[:10]
        for item in trending_items:
            # Ensure media_type is set (default to 'movie' if not present)
            if not item.get('media_type'):
                item['media_type'] = 'movie'
            # Normalize 'tv' to match our item_type convention
            if item['media_type'] == 'tv':
                item['media_type'] = 'tv'
        context['trending_now'] = trending_items
        
        # Add AI recommended movies and series if user is authenticated
        if request.user.is_authenticated:
            # Get AI recommendations from database
            ai_recommendations = AIRecommendation.objects.filter(user=request.user)
            context['ai_recommended_movies'] = [
                {
                    'id': rec.item_id,
                    'title': rec.item_title,
                    'poster_path': rec.poster_path,
                    'tmdb_rating': rec.tmdb_rating,
                    'media_type': rec.item_type
                }
                for rec in ai_recommendations.filter(item_type='movie')
            ]
            context['ai_recommended_series'] = [
                {
                    'id': rec.item_id,
                    'title': rec.item_title,
                    'poster_path': rec.poster_path,
                    'tmdb_rating': rec.tmdb_rating,
                    'media_type': rec.item_type
                }
                for rec in ai_recommendations.filter(item_type='tv')
            ]
            print("Debug - AI Recommendations:")
            print(f"Movies: {context['ai_recommended_movies']}")
            print(f"Series: {context['ai_recommended_series']}")

        # Add like and watchlist status for all items
        if request.user.is_authenticated:
            for list_items in ['ai_recommended_movies', 'ai_recommended_series', 'latest_movies', 'latest_series', 'trending_now']:
                for item in context.get(list_items, []):
                    item_id = item.get('id')
                    if UserLike.objects.filter(user=request.user, item_id=item_id).exists():
                        item['is_liked'] = True
                    else:
                        item['is_liked'] = False
                    
                    if UserWatchlist.objects.filter(user=request.user, item_id=item_id).exists():
                        item['in_watchlist'] = True
                    else:
                        item['in_watchlist'] = False
        
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
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)

        if not prompt or not isinstance(prompt, str) or not prompt.strip():
            return JsonResponse({"error": "Invalid input. Expected JSON string."}, status=400)

        ai_response_string = send_prompt_to_ai(prompt.strip())

        if not ai_response_string:
            return JsonResponse({"error": "Failed to get response from AI. Please try again later."}, status=502)

        try:
            ai_suggestions_dict = ast.literal_eval(ai_response_string.strip())
            if not isinstance(ai_suggestions_dict, dict):
                raise ValueError("AI response was not a dictionary after parsing.")
        except (ValueError, SyntaxError) as e:
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
            series_data = [res for res in series_results if res is not None]

        final_response = {"movies": movies_data, "shows": series_data}

        return JsonResponse(final_response)


class MovieDetailView(View):
    def get(self, request, movie_id):
        movie_details = get_movie_details(movie_id)
        if not movie_details:
            return redirect('home_page')

        # Normalize title and date fields
        if 'name' in movie_details and not 'title' in movie_details:
            movie_details['title'] = movie_details['name']
        if 'first_air_date' in movie_details and not 'release_date' in movie_details:
            movie_details['release_date'] = movie_details['first_air_date']

        # Ensure full URLs for images
        if movie_details.get('poster_path'):
            if not movie_details['poster_path'].startswith('http'):
                movie_details['poster_path'] = f"https://image.tmdb.org/t/p/w500{movie_details['poster_path']}"

        # Process cast profile images and find director
        if movie_details.get('credits', {}).get('cast'):
            movie_details['credits']['cast'] = movie_details['credits']['cast'][:8]
            for cast_member in movie_details['credits']['cast']:
                if cast_member.get('profile_path'):
                    if not cast_member['profile_path'].startswith('http'):
                        cast_member['profile_path'] = f"https://image.tmdb.org/t/p/w185{cast_member['profile_path']}"
            for crew_member in movie_details['credits']['crew']:
                if crew_member.get('job') == "Director":
                    movie_details['director'] = crew_member['name']
                    break
            
        # calculate runtime
        if movie_details.get('runtime'):
            hours = movie_details['runtime'] // 60
            minutes = movie_details['runtime'] % 60
            movie_details['runtime'] = f"{hours}h {minutes}min"
        
        context = {
            'item': movie_details,
            'item_type': 'movie'
        }

        if request.user.is_authenticated:
            context['is_liked'] = UserLike.objects.filter(
                user=request.user,
                item_id=movie_id,
                item_type='movie'
            ).exists()
            context['in_watchlist'] = UserWatchlist.objects.filter(
                user=request.user,
                item_id=movie_id,
                item_type='movie'
            ).exists()
        
        return render(request, 'core/detail_page.html', context)


class SeriesDetailView(View):
    def get(self, request, series_id):
        series_details = get_tv_details(series_id)
        if not series_details:
            return redirect('home_page')

        # Normalize title and date fields
        if 'name' in series_details and not 'title' in series_details:
            series_details['title'] = series_details['name']
        if 'first_air_date' in series_details and not 'release_date' in series_details:
            series_details['release_date'] = series_details['first_air_date']

        # Ensure full URLs for images
        if series_details.get('poster_path'):
            if not series_details['poster_path'].startswith('http'):
                series_details['poster_path'] = f"https://image.tmdb.org/t/p/w500{series_details['poster_path']}"
        
        # Process cast profile images
        if series_details.get('credits', {}).get('cast'):
            series_details['credits']['cast'] = series_details['credits']['cast'][:8]
            for cast_member in series_details['credits']['cast']:
                if cast_member.get('profile_path'):
                    if not cast_member['profile_path'].startswith('http'):
                        cast_member['profile_path'] = f"https://image.tmdb.org/t/p/w185{cast_member['profile_path']}"
            for crew_member in series_details['credits']['crew']:
                if crew_member.get('job') == "Director":
                    series_details['director'] = crew_member['name']
                    break

        context = {
            'item': series_details,
            'item_type': 'tv'
        }

        if request.user.is_authenticated:
            context['is_liked'] = UserLike.objects.filter(
                user=request.user,
                item_id=series_id,
                item_type='tv'
            ).exists()
            context['in_watchlist'] = UserWatchlist.objects.filter(
                user=request.user,
                item_id=series_id,
                item_type='tv'
            ).exists()

        return render(request, 'core/detail_page.html', context)


class ActorDetailView(View):
    def get(self, request, actor_id):
        actor_details = get_actor_details(actor_id)
        if not actor_details:
            return redirect('home_page')
        
        if actor_details.get('credits').get('cast'):
            actor_details['credits']['cast'] = actor_details['credits']['cast'][:10]
        if actor_details.get('credits').get('crew'):
            actor_details['credits']['crew'] = []
        if actor_details.get('imdb_id'):
            actor_details['imdb_page'] = f"https://www.imdb.com/name/{actor_details['imdb_id']}/"
        if actor_details.get('profile_path'):
            actor_details['profile_path'] = f"https://image.tmdb.org/t/p/w500{actor_details['profile_path']}"
        if actor_details.get('gender') == 1:
            actor_details['gender'] = 'Female'
        elif actor_details.get('gender') == 2:
            actor_details['gender'] = 'Male'
        else:
            actor_details['gender'] = '-'
        


        context = {
            'item': actor_details,
            'item_type': 'actor'    
        }
        
        return render(request, 'core/detail_actor_page.html', context)

class ToggleLikeView(LoginRequiredMixin, View):
    def post(self, request):
        item_id = request.POST.get('item_id')
        item_type = request.POST.get('item_type')
        item_title = request.POST.get('item_title')
        
        if not item_id or item_type not in ['movie', 'tv'] or not item_title:
            return JsonResponse({'error': 'Invalid request'}, status=400)

        try:
            like_obj = UserLike.objects.get(
                user=request.user,
                item_id=item_id,
                item_type=item_type
            )
            like_obj.delete()
            is_liked = False
        except UserLike.DoesNotExist:
            UserLike.objects.create(
                user=request.user,
                item_id=item_id,
                item_type=item_type,
                item_title=item_title
            )
            is_liked = True

        # Trigger AI recommendations update
        task = update_ai_recommendations.delay(request.user.id)
        
        return JsonResponse({'is_liked': is_liked})


class ToggleWatchlistView(LoginRequiredMixin, View):
    def post(self, request):
        item_id = request.POST.get('item_id')
        item_type = request.POST.get('item_type')
        item_title = request.POST.get('item_title')
        
        if not item_id or item_type not in ['movie', 'tv'] or not item_title:
            return JsonResponse({'error': 'Invalid request'}, status=400)
        
        try:
            watchlist_obj = UserWatchlist.objects.get(
                user=request.user,
                item_id=item_id,
                item_type=item_type
            )
            watchlist_obj.delete()
            in_watchlist = False
        except UserWatchlist.DoesNotExist:
            UserWatchlist.objects.create(
                user=request.user,
                item_id=item_id,
                item_type=item_type,
                item_title=item_title
            )
            in_watchlist = True
        
        return JsonResponse({'in_watchlist': in_watchlist})
