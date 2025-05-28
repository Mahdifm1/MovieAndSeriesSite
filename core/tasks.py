import json
import asyncio
import aiohttp
from celery import shared_task
from redis import Redis
from django.conf import settings
from .tmbd_api import *
from .models import UserLike, AIRecommendation
from .ai_api import send_prompt_to_ai
from django.contrib.auth import get_user_model

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


async def fetch_details(session, title, media_type):
    """Helper function to fetch details for a movie or TV show."""
    try:
        search_result = await search_tmdb_item_details_async(session, title.strip(), media_type)
        if search_result and search_result.get('id'):
            details = get_movie_details(search_result['id']) if media_type == 'movie' else get_tv_details(search_result['id'])
            if details:
                print(f"Successfully fetched {media_type} details for {title}: {details.get('id')}")
                return details
            else:
                print(f"Could not get {media_type} details for {title} with ID {search_result['id']}")
        else:
            print(f"No search results found for {media_type}: {title}")
        return None
    except Exception as e:
        print(f"Error in fetch_details for {media_type} {title}: {str(e)}")
        return None


@shared_task
def update_ai_recommendations(user_id):
    User = get_user_model()
    user = User.objects.get(id=user_id)

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

    # Clear old recommendations
    AIRecommendation.objects.filter(user=user).delete()

    movie_prompt = f"""Based on the user's liked movies: {', '.join(movie_titles)}, 
    suggest 5 similar movies they might enjoy. Consider genres, themes, and overall style."""

    series_prompt = f"""Based on the user's liked TV series: {', '.join(series_titles)}, 
    suggest 5 similar TV series they might enjoy. Consider genres, themes, and overall style."""

    # Get AI recommendations
    if movie_titles:
        movie_suggestions = send_prompt_to_ai(movie_prompt)
        if movie_suggestions:
            try:
                # Clean up the response string to ensure it's valid JSON
                cleaned_response = movie_suggestions.strip()
                # Replace single quotes with double quotes for JSON compatibility
                cleaned_response = cleaned_response.replace("'", '"')
                movie_suggestions_dict = json.loads(cleaned_response)
                movie_titles_from_ai = movie_suggestions_dict.get('movies', [])[:5]
                print(f"AI suggested movies: {movie_titles_from_ai}")
                
                # Get movie details from TMDB
                async def get_all_movie_details():
                    async with aiohttp.ClientSession() as session:
                        tasks = [
                            fetch_details(session, title, 'movie')
                            for title in movie_titles_from_ai
                            if isinstance(title, str) and title.strip()
                        ]
                        results = await asyncio.gather(*tasks)
                        return [res for res in results if res is not None]

                movie_details = asyncio.run(get_all_movie_details())
                print(f"Found details for {len(movie_details)} movies")
                
                # Store in database with normalized fields
                for movie in movie_details:
                    try:
                        AIRecommendation.objects.create(
                            user=user,
                            item_id=movie.get('id'),
                            item_type='movie',
                            item_title=movie.get('title'),  # Movies use 'title'
                            poster_path=movie.get('poster_path'),  # Already includes base URL
                            tmdb_rating=movie.get('vote_average')
                        )
                        print(f"Saved movie recommendation: {movie.get('title')}")
                    except Exception as e:
                        print(f"Error saving movie recommendation: {str(e)}")
            except Exception as e:
                print(f"Error processing movie recommendations: {str(e)}")
                print(f"Raw AI response: {movie_suggestions}")

    if series_titles:
        series_suggestions = send_prompt_to_ai(series_prompt)
        if series_suggestions:
            try:
                # Clean up the response string to ensure it's valid JSON
                cleaned_response = series_suggestions.strip()
                # Replace single quotes with double quotes for JSON compatibility
                cleaned_response = cleaned_response.replace("'", '"')
                series_suggestions_dict = json.loads(cleaned_response)
                series_titles_from_ai = series_suggestions_dict.get('series', [])[:5]
                print(f"AI suggested series: {series_titles_from_ai}")
                
                # Get series details from TMDB
                async def get_all_series_details():
                    async with aiohttp.ClientSession() as session:
                        tasks = [
                            fetch_details(session, title, 'tv')
                            for title in series_titles_from_ai
                            if isinstance(title, str) and title.strip()
                        ]
                        results = await asyncio.gather(*tasks)
                        return [res for res in results if res is not None]

                series_details = asyncio.run(get_all_series_details())
                print(f"Found details for {len(series_details)} series")
                
                # Store in database with normalized fields
                for series in series_details:
                    try:
                        AIRecommendation.objects.create(
                            user=user,
                            item_id=series.get('id'),
                            item_type='tv',
                            item_title=series.get('name'),  # TV shows use 'name', but we normalize to 'title'
                            poster_path=f"https://image.tmdb.org/t/p/w500{series.get('poster_path')}" if series.get('poster_path') else None,
                            tmdb_rating=series.get('vote_average')
                        )
                        print(f"Saved series recommendation: {series.get('name')}")
                    except Exception as e:
                        print(f"Error saving series recommendation: {str(e)}")
            except Exception as e:
                print(f"Error processing series recommendations: {str(e)}")
                print(f"Raw AI response: {series_suggestions}")

    return True
