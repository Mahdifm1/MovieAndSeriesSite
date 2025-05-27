import json
import asyncio
import aiohttp
from celery import shared_task
from redis import Redis
from django.conf import settings
from .tmdp_api import *
from .models import UserLike
from .ai_api import send_prompt_to_ai

r = Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


@shared_task()
def get_and_store_latest_movies_and_series_task():
    movies_list = get_and_store_latest_movies_or_series("movies").get("processed_list")
    series_list = get_and_store_latest_movies_or_series("series").get("processed_list")
    return {"latest_movies": movies_list, "latest_series": series_list}


def get_and_store_latest_movies_or_series(v_type):
    # fetch data
    if v_type == "movies":
        latest_list = get_latest_movies_list(page=1).get("results")
    else:
        latest_list = get_latest_series_list(page=1).get("results")

    if not latest_list:
        return 'no movie found'

    # remove old data
    redis_movie_or_series_key = f'latest_{v_type}'
    r.delete(redis_movie_or_series_key)

    try:
        # save data in redis
        r.set(redis_movie_or_series_key, json.dumps(latest_list))
        return {"status": "success", "processed_list": latest_list}
    except Exception as e:
        return {"status": "failed", "processed_list": latest_list}


@shared_task
def get_trending_movies_and_series_task():
    # fetch data
    trending_list = get_trending_movies_and_series_list().get("results")
    redis_trending_key = "trending_movies_and_series"

    # remove old data
    r.delete(redis_trending_key)

    try:
        # save data in redis
        r.set(redis_trending_key, json.dumps(trending_list))
        return {"status": "success", "processed_list": trending_list}
    except Exception as e:
        return {"status": "failed", "processed_list": trending_list}


@shared_task
def update_ai_recommendations(user_id):
    # Get user's last 30 liked movies
    movie_likes = UserLike.objects.filter(
        user_id=user_id,
        item_type='movie'
    ).order_by('-created_at')[:30]

    # Get user's last 30 liked series
    series_likes = UserLike.objects.filter(
        user_id=user_id,
        item_type='tv'
    ).order_by('-created_at')[:30]

    # Create prompts for AI
    movie_titles = [like.item_title for like in movie_likes]
    series_titles = [like.item_title for like in series_likes]

    movie_prompt = f"""Based on the user's liked movies: {', '.join(movie_titles)}, 
    suggest 5 similar movies they might enjoy. Consider genres, themes, and overall style."""

    series_prompt = f"""Based on the user's liked TV series: {', '.join(series_titles)}, 
    suggest 5 similar TV series they might enjoy. Consider genres, themes, and overall style."""

    # Get AI recommendations
    if movie_titles:
        movie_suggestions = send_prompt_to_ai(movie_prompt)
        if movie_suggestions:
            try:
                movie_suggestions_dict = json.loads(movie_suggestions)
                movie_titles_from_ai = movie_suggestions_dict.get('movies', [])[:5]
                
                # Get movie details from TMDB
                async def get_movie_details():
                    async with aiohttp.ClientSession() as session:
                        tasks = [
                            search_tmdb_item_details_async(session, title.strip(), "movie")
                            for title in movie_titles_from_ai if isinstance(title, str) and title.strip()
                        ]
                        results = await asyncio.gather(*tasks)
                        return [res for res in results if res is not None]

                movie_details = asyncio.run(get_movie_details())
                
                # Store in Redis
                from django.core.cache import cache
                cache.set(f'ai_recommended_movies_{user_id}', json.dumps(movie_details), timeout=86400)  # 24 hours
            except Exception as e:
                print(f"Error processing movie recommendations: {e}")

    if series_titles:
        series_suggestions = send_prompt_to_ai(series_prompt)
        if series_suggestions:
            try:
                series_suggestions_dict = json.loads(series_suggestions)
                series_titles_from_ai = series_suggestions_dict.get('series', [])[:5]
                
                # Get series details from TMDB
                async def get_series_details():
                    async with aiohttp.ClientSession() as session:
                        tasks = [
                            search_tmdb_item_details_async(session, title.strip(), "tv")
                            for title in series_titles_from_ai if isinstance(title, str) and title.strip()
                        ]
                        results = await asyncio.gather(*tasks)
                        return [res for res in results if res is not None]

                series_details = asyncio.run(get_series_details())
                
                # Store in Redis
                from django.core.cache import cache
                cache.set(f'ai_recommended_shows_{user_id}', json.dumps(series_details), timeout=86400)  # 24 hours
            except Exception as e:
                print(f"Error processing series recommendations: {e}")

    return True
