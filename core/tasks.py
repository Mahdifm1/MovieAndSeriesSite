import json

from celery import shared_task
from redis import Redis
from .tmdp import *

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
