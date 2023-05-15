from django.apps import AppConfig


class ShowsConfig(AppConfig):
    name = 'shows'

    def ready(self):
        from datetime import datetime
        from apscheduler.schedulers.background import BackgroundScheduler
        from .views import update_shows
        scheduler = BackgroundScheduler()
        scheduler.add_job(update_shows, 'cron', hour='1', minute='0')
        scheduler.start()
