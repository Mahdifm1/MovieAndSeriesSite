import json

from celery import shared_task
from django.conf import settings
from redis import Redis
from .tmdp import *

r = Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


@shared_task
def get_and_store_latest_movies():
    # fetch data
    latest_movies_list = get_latest_movies_list(page=1)
    if not latest_movies_list:
        return 'no movie found'
    # current_page = latest_movies_dict.get('page')
    # total_pages = latest_movies_dict.get('total_pages')
    # total_movies = latest_movies_dict.get('total_results')

    # remove last data
    redis_movies_key = 'latest_movies'
    r.delete(redis_movies_key)

    processed_movies_list = []
    for movie in latest_movies_list:
        processed_movies = {
            'id': movie.get('id'),
            'title': movie.get('title'),
            'release_date': movie.get('release_date'),
            'backdrop_path': f"https://image.tmdb.org/t/p/w342/{movie.get('backdrop_path')}",
            'poster_path': f"https://image.tmdb.org/t/p/w780/{movie.get('poster_path')}",
            'genre_ids': movie.get('genre_ids'),
            'language': movie.get('original_language'),
            'overview': movie.get('overview'),
            'tmdb_rating': movie.get('vote_average'),
        }
        processed_movies_list.append(processed_movies)

    try:
        # save data in redis
        r.set(redis_movies_key, json.dumps(processed_movies_list))
        return {"status": "success", "processed_movies_list": processed_movies_list}
    except Exception as e:
        return {"status": "failed", "processed_movies_list": processed_movies_list}


@shared_task
def get_and_store_latest_series():
    return get_latest_series_list(page=1)
