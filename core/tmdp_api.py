import requests
from datetime import date
from django.conf import settings
import aiohttp
import asyncio


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
            'release_date': latest.get('release_date') if latest.get('release_date') else latest.get('first_air_date'),
            'backdrop_path': f"https://image.tmdb.org/t/p/w342/{latest.get('backdrop_path')}",
            'poster_path': f"https://image.tmdb.org/t/p/w780/{latest.get('poster_path')}",
            'genre_ids': latest.get('genre_ids'),
            'language': latest.get('original_language'),
            'overview': latest.get('overview'),
            'tmdb_rating': latest.get('vote_average'),
            'media_type': v_type
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
            'release_date': trend.get('release_date') if trend.get('release_date') else trend.get('first_air_date'),
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

    if genre != 'all':
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
            "tmdb_rating": filtered.get('vote_average'),
            "media_type": v_type
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


async def search_tmdb_item_details_async(session, title='movie', v_type='movie'):
    url = f"https://api.themoviedb.org/3/search/{v_type}?query={title}&page=1"
    async with session.get(url, headers=headers, timeout=10) as response:
        response.raise_for_status()
        data = await response.json()

    if data.get('results'):
        item = data.get("results")[0]
    else:
        return None

    item_id = item.get('id')
    item_vote_average = item.get('vote_average', 0)
    item_poster_path = f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else None

    if v_type == 'movie':
        item_title = item.get('title', item.get("original_name", "Unknown Title"))
        item_released_date = item.get('release_date', '')
        year = item_released_date.split("-")[0] if item_released_date and "-" in item_released_date else "N/A"
    else:
        item_title = item.get('name', item.get("original_name", "Unknown Title"))
        item_first_air_date = item.get("first_air_date", "")
        year = item_first_air_date.split("-")[0] if item_first_air_date and "-" in item_first_air_date else "N/A"

    return {
        "id": item_id,
        "title": item_title,
        "poster_url": item_poster_path,
        "rating": item_vote_average,
        "year": year,
    }


def get_movie_details(movie_id):
    """Get detailed information about a movie."""
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {
        'api_key': settings.TMDB_API_KEY,
        'append_to_response': 'credits,videos,similar'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        movie_data = response.json()
        
        # Format the data
        if movie_data.get('genres'):
            movie_data['genres'] = [genre['name'] for genre in movie_data['genres']]
        if movie_data.get('production_companies'):
            movie_data['production_companies'] = [company['name'] for company in movie_data['production_companies']]
        if movie_data.get('poster_path'):
            movie_data['poster_path'] = f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
        if movie_data.get('backdrop_path'):
            movie_data['backdrop_path'] = f"https://image.tmdb.org/t/p/w500{movie_data['backdrop_path']}"
            
        return movie_data
    except requests.RequestException as e:
        print(f"Error fetching movie details: {e}")
        return None

def get_tv_details(series_id):
    """Get detailed information about a TV series."""
    url = f"https://api.themoviedb.org/3/tv/{series_id}"
    params = {
        'api_key': settings.TMDB_API_KEY,
        'append_to_response': 'credits,videos,similar'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        series_data = response.json()
        
        # Format the data
        if series_data.get('genres'):
            series_data['genres'] = [genre['name'] for genre in series_data['genres']]
        if series_data.get('networks'):
            series_data['networks'] = [network['name'] for network in series_data['networks']]
        if series_data.get('production_companies'):
            series_data['production_companies'] = [company['name'] for company in series_data['production_companies']]
        
        return series_data
    except requests.RequestException as e:
        print(f"Error fetching TV series details: {e}")
        return None


def get_actor_details(actor_id):
    url = f"https://api.themoviedb.org/3/person/{actor_id}"
    params = {
        'api_key': settings.TMDB_API_KEY,
        'append_to_response': 'credits,images,external_ids'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        actor_data = response.json()
        
        # Format the data
        if actor_data.get('gender') == 2:
            gender = 'male'
        elif actor_data.get('gender') == 1:
            gender = 'female'
        else:
            gender = '-'
    
        return actor_data
    except requests.RequestException as e:
        print(f"Error fetching actor details: {e}")
        return None

