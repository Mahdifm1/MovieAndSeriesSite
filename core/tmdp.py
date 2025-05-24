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
            'release_date': latest.get('release_date') if not latest.get('release_date') else latest.get(
                'first_air_date'),
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


def get_trending_movies_and_series_list():
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


def get_actor_id_by_name(name):
    url = f"https://api.themoviedb.org/3/search/person?query={name}&page=1"
    response = requests.get(url, headers=headers)

    if not response.status_code == 200:
        return response.raise_for_status()

    actors_list = response.json().get('results')[:10]
    actors_list_str = ''
    for actor in actors_list:
        actors_list_str += f"{actor.get('id')}|"

    if actors_list_str == '':
        return None
    return actors_list_str


def get_genre_id_by_name(v_type, name):
    url = f"https://api.themoviedb.org/3/genre/{v_type}/list"
    response = requests.get(url, headers=headers)

    if not response.status_code == 200:
        return response.raise_for_status()

    genre_list = response.json().get('genres')
    for genre in genre_list:
        if genre.get('name') == name:
            return genre.get('id')

    return None


def get_filtered_movies_and_series_list(page=1, actor=None, v_type='movie', year='all', rating='all', genre='all'):
    url = f"https://api.themoviedb.org/3/discover/{v_type}?sort_by=popularity.desc&page={page}&vote_average.gte={rating}"

    if year == 'older':
        url += f"&primary_release_date.lte=2020-01-01"
    else:
        url += f"&primary_release_year={year}"

    if actor:
        actor_id = get_actor_id_by_name(actor)
        if actor_id:
            url += f"&with_cast={actor_id}"
        else:
            response_dict = {
                "results": [],
                "current_page": 1,
                "total_pages": 1,
                "total_results": 0
            }
            return response_dict

    if genre is not 'all':
        genre_id = get_genre_id_by_name(v_type, genre)
        if genre_id is not None:
            url += f"&genre_ids={genre_id}"

    response = requests.get(url, headers=headers)
    if not response.status_code == 200:
        return response.raise_for_status()

    response_dict = response.json().get('results')
    filtered_list = []
    for filtered in response_dict:
        item = {
            "id": filtered.get('id'),
            "title": filtered.get('title') if filtered.get('title') else filtered.get("name"),
            "release_date": filtered.get('release_date') if filtered.get('release_date') else filtered.get(
                'first_air_date'),
            "backdrop_path": f"https://image.tmdb.org/t/p/w342/{filtered.get('backdrop_path')}",
            "poster_path": f"https://image.tmdb.org/t/p/w780/{filtered.get('poster_path')}",
            "genre_ids": filtered.get('genre_ids'),
            "language": filtered.get('original_language') if filtered.get('original_language') else filtered.get(
                'language'),
            "overview": filtered.get('overview'),
            "tmdb_rating": filtered.get('vote_average')
        }
        filtered_list.append(item)

    response_dict = {
        "results": filtered_list,
        "current_page": response.json().get('page'),
        "total_pages": response.json().get('total_pages'),
        "total_results": response.json().get('total_results')
    }

    return response_dict


def get_filtered_actors_list(name=None, page=1):
    url = f"https://api.themoviedb.org/3/search/person?page={page}"
    if name:
        url += f"&query={name}"
    print(url)
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return response.raise_for_status()

    actors_list = response.json().get('results')
    processed_list = clean_actors_list(actors_list)

    response_dict = {
        "results": processed_list,
        "current_page": response.json().get('page'),
        "total_pages": response.json().get('total_pages'),
        "total_results": response.json().get('total_results')
    }

    return response_dict


def get_trending_actors_list(page=1):
    url = f"https://api.themoviedb.org/3/trending/person/day?language=en-US"
    if page:
        url += f"&page={page}"

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return response.raise_for_status()

    actors_list = response.json().get('results')
    processed_list = clean_actors_list(actors_list)

    response_dict = {
        "results": processed_list,
        "current_page": response.json().get('page'),
        "total_pages": response.json().get('total_pages'),
        "total_results": response.json().get('total_results')
    }

    return response_dict


def clean_actors_list(actors_list):
    processed_list = []
    for actor in actors_list:
        if actor.get('gender') == 2:
            gender = 'male'
        elif actor.get('gender') == 1:
            gender = 'female'
        else:
            gender = '-'
        actors_dict = {
            "id": actor.get('id'),
            "name": actor.get('name'),
            "gender": gender,
            "popularity": actor.get('popularity'),
            "profile_path": f"https://image.tmdb.org/t/p/h632/{actor.get('profile_path')}",
        }
        processed_list.append(actors_dict)

    return processed_list
