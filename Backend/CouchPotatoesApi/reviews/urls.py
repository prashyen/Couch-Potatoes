from django.urls import path
from reviews.views import ReviewView, ShowReviewView, ShowRatingView

urlpatterns = [
    path("Review", ReviewView.as_view()),
    path("ShowReviews", ShowReviewView.as_view()),
    path("ShowRating", ShowRatingView.as_view()),
]