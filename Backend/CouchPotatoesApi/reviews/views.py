from datetime import datetime

from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from reviews.models import ShowReview
from reviews.serializers import ReviewSerializer
from shows.models import Show


@method_decorator(csrf_protect, name='dispatch')
class ReviewView(APIView):
    def post(self, request, format=None):
        try:
            curr_user = request.user
            show_id = request.data["show_id"]
            if not Show.objects.filter(show_id=show_id).exists():
                return Response(status=status.HTTP_404_NOT_FOUND, data="Show not found")

            if ShowReview.objects.filter(user=curr_user, show_id=show_id).exists():
                review = ShowReview.objects.get(user=curr_user, show_id=show_id)
                review.comment = request.data["comment"]
                review.rating = request.data["rating"]
            else:
                review = ShowReview(user=curr_user, show_id=show_id, comment=request.data["comment"],
                                    rating=request.data["rating"], username=curr_user.username)
            review.save()
            reviews = ShowReview.objects.filter(show_id=show_id)
            ratings = [curr_review.rating for curr_review in reviews]
            rating = 0
            if ratings:
                rating = round(sum(ratings)/len(ratings), 2)
            show = Show.objects.get(show_id=show_id)
            show.rating = rating
            show.save()
            return Response(status=status.HTTP_201_CREATED, data="Review Added")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")

    def delete(self, request, format=None):
        try:
            curr_user = request.user
            show_id = request.query_params["show_id"]
            if not Show.objects.filter(show_id=show_id).exists():
                return Response(status=status.HTTP_404_NOT_FOUND, data="Show not found")

            if ShowReview.objects.filter(user=curr_user, show_id=show_id).exists():
                review = ShowReview.objects.get(user=curr_user, show_id=show_id)
                review.delete()
                return Response(status=status.HTTP_200_OK, data="Review Deleted")
            else:
                return Response(status=status.HTTP_404_NOT_FOUND, data="Review Not Found")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class ShowReviewView(APIView):
    def get(self, request, format=None):
        try:
            show_id = request.query_params["show_id"]
            if not Show.objects.filter(show_id=show_id).exists():
                return Response(status=status.HTTP_404_NOT_FOUND, data="Show not found")
            reviews = ReviewSerializer(ShowReview.objects.filter(show_id=show_id), many=True).data
            return Response(reviews, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class ShowRatingView(APIView):
    def get(self, request, format=None):
        try:
            show_id = request.query_params["show_id"]
            if not Show.objects.filter(show_id=show_id).exists():
                return Response(status=status.HTTP_404_NOT_FOUND, data="Show not found")
            reviews = ShowReview.objects.filter(show_id=show_id)
            ratings = [review.rating for review in reviews]
            if ratings:
                rating = round(sum(ratings)/len(ratings), 2)
                return Response({"rating": rating}, status=status.HTTP_200_OK)
            else:
                return Response({"rating": 0}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")
