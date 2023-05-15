from django.contrib.auth.models import User
from djongo import models
from datetime import datetime


class ShowReview(models.Model):
    id = models.AutoField(primary_key=True)
    show_id = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=255, default="")
    comment = models.CharField(max_length=1000, default="")
    rating = models.IntegerField(default=0)
    last_modified = models.DateTimeField(auto_now=True)
