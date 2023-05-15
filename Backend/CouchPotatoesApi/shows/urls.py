from django.urls import path

from .views import TvdbSearchView, ShowInfoView, BrowseShowsView, PopularShowsView, ShowImageView, EpisodeView

urlpatterns = [
    path("Search", TvdbSearchView.as_view()),
    path("Information", ShowInfoView.as_view()),
    path("BrowseShows", BrowseShowsView.as_view()),
    path("PopularShows", PopularShowsView.as_view()),
    path("ShowImage", ShowImageView.as_view()),
    path("Episodes", EpisodeView.as_view()),
]