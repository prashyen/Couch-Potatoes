from djongo import models
from django.contrib.auth.models import User


# Create your models here.
class AbstractShow(models.Model):
    class WatchStatus(models.IntegerChoices):
        PLAN_TO_WATCH = 0
        WATCHING = 1
        COMPLETED = 2

    id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    status = models.IntegerField(choices=WatchStatus)
    ep_number = models.IntegerField(default=0)

    class Meta:
        abstract = True


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.CharField(max_length=255, default='')
    show_list = models.ArrayField(model_container=AbstractShow, default=[])
    total_watch_time = models.FloatField(default=0)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    profile_picture = models.ImageField(null=True, blank=True, upload_to='profile_pictures')

