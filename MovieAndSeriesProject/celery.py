import os
from MovieAndSeriesProject import settings
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MovieAndSeriesProject.settings')

app = Celery('MovieAndSeriesProject')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()
