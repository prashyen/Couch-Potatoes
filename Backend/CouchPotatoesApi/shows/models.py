from djongo import models
from django.db.models import AutoField


# Create your models here.
class Show(models.Model):
    id = AutoField(primary_key=True)
    name = models.CharField(max_length=255, default="")
    show_id = models.IntegerField(default=0)
    num_watchers = models.IntegerField(default=1)
    rating = models.FloatField(default=0)
    num_episodes = models.IntegerField(default=0)
    avg_runtime = models.FloatField(default=0)

