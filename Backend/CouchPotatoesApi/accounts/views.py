from django.contrib import auth
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status

from user_profile.models import UserProfile, AbstractShow


@method_decorator(csrf_protect, name='dispatch')
class CheckAuthenticatedView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK, data={"isAuthenticated": "success"})
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={"isAuthenticated": "error"})


@method_decorator(csrf_protect, name='dispatch')
class SignupView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request, format=None):
        try:
            data = request.data

            username = data['username']
            password = data['password']
            email = data['email']
            first_name = data['first_name']
            last_name = data['last_name']
            file = request.data['file'] if 'file' in request.data else None

            if User.objects.filter(username=username).exists():
                return Response(status=status.HTTP_409_CONFLICT, data="Username already exists")

            if UserProfile.objects.filter(email=email):
                return Response(status=status.HTTP_409_CONFLICT, data="E-mail already in use")

            user = User.objects.create_user(username=username, password=password)
            user.save()
            user = User.objects.get(username=username)

            user_profile = UserProfile(user=user, email=email, first_name=first_name, last_name=last_name)
            if file:
                user_profile.profile_picture = file
            user_profile.save()
            auth.login(request, user)
            response = Response(status=status.HTTP_201_CREATED, data="Success")
            response.set_cookie("username", username, max_age=60*60*24*7*4)
            return response
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        try:
            data = request.data

            username = data['username']
            password = data['password']

            user = auth.authenticate(username=username, password=password)

            if user is not None:
                auth.login(request, user)
                response = Response(status=status.HTTP_201_CREATED, data="Success")
                response.set_cookie("username", username, max_age=60*60*24*7*4)
                return response

            return Response(status=status.HTTP_401_UNAUTHORIZED, data="Invalid Credentials")

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            auth.logout(request)
            response = Response(status=status.HTTP_200_OK, data="Success")
            response.delete_cookie("username")
            return response
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCsrfTokenView(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, format=None):
        try:
            return Response(status=status.HTTP_200_OK, data="CSRF Cookie Set")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")
