from django.urls import path

from .views import ShowListView, UserProfileView, ShowStatusView, ShowEpisodeView, ProfilePictureView, \
    UserProfilePictureView

urlpatterns = [
    path("ShowList", ShowListView.as_view()),
    path("ShowStatus", ShowStatusView.as_view()),
    path("ShowEpisode", ShowEpisodeView.as_view()),
    path("Profile", UserProfileView.as_view()),
    path("Picture", ProfilePictureView.as_view()),
    path("UserPicture", UserProfilePictureView.as_view()),
]