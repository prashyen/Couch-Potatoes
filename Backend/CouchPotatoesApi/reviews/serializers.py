from rest_framework import serializers
from .models import ShowReview


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShowReview
        fields = '__all__'
