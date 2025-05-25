from openai import OpenAI
from django.conf import settings

# use liara ai api to access chatgpt for free
client = OpenAI(
    base_url="https://ai.liara.ir/api/v1/6833440706c1c610e6af12af",
    api_key=settings.LIARA_API_KEY,
)


def send_prompt_to_ai(prompt):
    base_prompt = '''
    You are an AI assistant for a movie and series recommendation website. Your primary goal is to provide exactly 5 movie titles and 5 series titles based on the user's request that will follow.
    It is absolutely crucial that your entire response consists ONLY of a single string that can be directly parsed into a Python dictionary. The format MUST be exactly as follows:
    {'movies': ['Movie Title One', 'Movie Title Two', 'Movie Title Three', 'Movie Title Four', 'Movie Title Five'], 'series': ['Series Title One', 'Series Title Two', 'Series Title Three', 'Series Title Four', 'Series Title Five']}
    Do not include any introductory text, explanations, apologies, or any markdown formatting (like ```json or ```python) before or after this single dictionary string. Only output the dictionary string itself. Replace 'Movie Title One', etc., with the actual recommended titles based on the user's request. Ensure there are exactly 5 unique movie titles and 5 unique series titles.
    The user's request is:
    '''
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": base_prompt + prompt
                }
            ]
        )
    except Exception as e:
        return None

    return completion.choices[0].message.content
