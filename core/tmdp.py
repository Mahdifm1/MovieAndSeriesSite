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

    if response.status_code == 200:
        return response.json().get('results')
    else:
        response.raise_for_status()
        return None


def get_latest_movies_list(page=1):
    return get_latest_movie_series_list(page=page, v_type="movie")


def get_latest_series_list(page=1):
    return get_latest_movie_series_list(page=page, v_type="tv")


def get_filtered_movies_and_series():
    pass


# def get_actors_list_by_movie_and_series_id(id, v_type):
#     url = "https://api.themoviedb.org/3/movie/950387/credits?language=en-US"
#     response = requests.get(url, headers=headers)
#
#     if response.status_code == 200:
#         return response.json()
