from django.urls import path
from .views import SignupView, GetCsrfTokenView, LoginView, LogoutView, CheckAuthenticatedView

urlpatterns = [
    path('signup', SignupView.as_view()),
    path('csrf', GetCsrfTokenView.as_view()),
    path('login', LoginView.as_view()),
    path('logout', LogoutView.as_view()),
    path('isAuthenticated', CheckAuthenticatedView.as_view()),
]