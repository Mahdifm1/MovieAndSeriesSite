import requests
from datetime import date
from django.conf import settings

headers = {
    "accept": "application/json",
    "Authorization": settings.ANOTHER_SECRET
}


def get_latest_movie_series_list(v_type, page=1):
    today = date.today()
    url = (f"https://api.themoviedb.org/3/discover/{v_type}?"
           f"page={page}&primary_release_date.lte={today}&sort_by=primary_release_date.desc")
    response = requests.get(url, headers=headers)

    if not response.status_code == 200:
        return response.raise_for_status()

    latest_list = response.json().get("results")

    processed_list = []
    for latest in latest_list:
        processed = {
            'id': latest.get('id'),
            'title': latest.get('title') if latest.get('title') else latest.get('name'),
            'release_date': latest.get('release_date') if not latest.get('release_date') else latest.get('first_air_date'),
            'backdrop_path': f"https://image.tmdb.org/t/p/w342/{latest.get('backdrop_path')}",
            'poster_path': f"https://image.tmdb.org/t/p/w780/{latest.get('poster_path')}",
            'genre_ids': latest.get('genre_ids'),
            'language': latest.get('original_language'),
            'overview': latest.get('overview'),
            'tmdb_rating': latest.get('vote_average'),
        }
        processed_list.append(processed)

    response_dict = {
        "results": processed_list,
        "current_page": response.json().get('page'),
        "total_pages": response.json().get('total_pages'),
        "total_results": response.json().get('total_results')
    }

    return response_dict


def get_latest_movies_list(page=1):
    return get_latest_movie_series_list(page=page, v_type="movie")


def get_latest_series_list(page=1):
    return get_latest_movie_series_list(page=page, v_type="tv")


def get_filtered_movies_and_series():
    pass


def get_trending_movies_and_series():
    url = "https://api.themoviedb.org/3/trending/all/day?language=en-US"
    response = requests.get(url, headers=headers)

    if not response.status_code == 200:
        return response.raise_for_status()

    trending_list = response.json().get('results')

    processed_list = []
    for trend in trending_list:
        processed = {
            'id': trend.get('id'),
            'title': trend.get('title') if trend.get('title') else trend.get("name"),
            'release_date': trend.get('release_date') if trend.get('release_data') else trend.get('first_air_date'),
            'backdrop_path': f"https://image.tmdb.org/t/p/w342/{trend.get('backdrop_path')}",
            'poster_path': f"https://image.tmdb.org/t/p/w780/{trend.get('poster_path')}",
            'media_type': trend.get('media_type'),
            'genre_ids': trend.get('genre_ids'),
            'language': trend.get('original_language'),
            'overview': trend.get('overview'),
            'tmdb_rating': trend.get('vote_average'),
            'popularity': trend.get('popularity'),
        }
        processed_list.append(processed)

    response_dict = {
        "results": processed_list,
        "current_page": response.json().get('page'),
        "total_pages": response.json().get('total_pages'),
        "total_results": response.json().get('total_results')
    }

    return response_dict
