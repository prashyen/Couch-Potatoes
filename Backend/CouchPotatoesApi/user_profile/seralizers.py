from rest_framework import serializers
from .models import UserProfile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'show_list', 'total_watch_time', 'first_name', 'last_name']

