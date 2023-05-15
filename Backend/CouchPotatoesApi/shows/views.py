import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

from django.contrib.auth.models import User
from django.shortcuts import render
import requests
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from CouchPotatoesApi import constants
from json import loads
from shows.models import Show
from user_profile.models import AbstractShow, UserProfile
from .serializers import ShowSerializer


class TvdbSearchView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            set_tvdb_auth_token()
            headers = {"Authorization": constants.TVDB_TOKEN}
            r = requests.get(url=f"https://api4.thetvdb.com/v4/search?q={request.query_params['q']}&type=series", headers=headers)
            if r.status_code != 200:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Search Failed")
            return Response(status=status.HTTP_200_OK, data=loads(r.content)['data'])
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class ShowInfoView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            if request.user.is_authenticated:
                DbData = None
                if Show.objects.filter(show_id=request.query_params['show_id']).exists():
                    show = Show.objects.get(show_id=request.query_params['show_id'])
                    DbData = ShowSerializer(show).data
                set_tvdb_auth_token()
                headers = {"Authorization": constants.TVDB_TOKEN}
                r = requests.get(url=f"https://api4.thetvdb.com/v4/series/{request.query_params['show_id']}/extended", headers=headers)
                if r.status_code != 200:
                    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Search Failed")
                TvdbData = loads(r.content)['data']
                return Response(status=status.HTTP_200_OK, data={"cpdb": DbData, "tvdb": TvdbData})
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED, data="Access Denied")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class BrowseShowsView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            set_tvdb_auth_token()
            headers = {"Authorization": constants.TVDB_TOKEN}
            r = requests.get(url=f"https://api4.thetvdb.com/v4/series?page={request.query_params['page']}", headers=headers)
            if r.status_code != 200:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Search Failed")
            return Response(status=status.HTTP_200_OK, data=loads(r.content)['data'])
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class PopularShowsView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            if 'rated' not in request.query_params:
                shows = ShowSerializer(Show.objects.all().order_by('-num_watchers')[:6], many=True).data
            else:
                shows = ShowSerializer(Show.objects.all().order_by('-rating', '-num_watchers')[:6], many=True).data
            return Response(status=status.HTTP_200_OK, data=shows)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class ShowImageView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            set_tvdb_auth_token()
            headers = {"Authorization": constants.TVDB_TOKEN}
            r = requests.get(url=f"https://api4.thetvdb.com/v4/series/{request.query_params['show_id']}", headers=headers)
            if r.status_code != 200:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Search Failed")
            return Response(status=status.HTTP_200_OK, data=loads(r.content)['data']['image'])
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class EpisodeView(APIView):
    def get(self, request, format=None):
        try:
            episodes = []
            if "shows" in request.query_params:
                for show_id in json.loads(request.query_params['shows']):
                    curr_show = Show.objects.get(show_id=show_id)
                    episodes.append(curr_show.num_episodes)
            else:
                episodes = {show.show_id: show.num_episodes for show in Show.objects.all()}
            return Response(status=status.HTTP_200_OK, data=episodes)

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


def update_shows():
    from user_profile.views import show_info
    # first get all shows
    shows = Show.objects.all()
    set_tvdb_auth_token()
    # iterate through each show requesting the tvdb info
    for show in shows:
        tvdb_id = show.show_id
        r = requests.get(f"https://api4.thetvdb.com/v4/series/{tvdb_id}",
                         headers={"Authorization": constants.TVDB_TOKEN})
        data = json.loads(r.content)["data"]
        keep_updated = data["status"]["keepUpdated"]
        if keep_updated:
            num_episodes, runtime, n = show_info(tvdb_id)
            if num_episodes != show.num_episodes:
                show.num_episodes = num_episodes
                show.avg_runtime = runtime
                show.save()
                update_users(tvdb_id)


def update_users(show_id):
    profiles = UserProfile.objects.all()
    for profile in profiles:
        for show in profile.show_list:
            if int(show['id']) == int(show_id) and (show['status'] == 1 or show['status'] == 2):
                show['status'] = AbstractShow.WatchStatus.WATCHING
                profile.save()
                send_emails(profile.email, show['name'])

def set_tvdb_auth_token():
    r = requests.post("https://api4.thetvdb.com/v4/login", json={
        "apikey": constants.TVDB_API_KEY,
        "pin": constants.TVDB_PIN
    })
    constants.TVDB_TOKEN = loads(r.content)["data"]["token"]


def send_emails(user_email, show_name):
    subject = "Shows On Your List Have Been Updated!"
    body = show_name + " on your list has a new episode out!"
    sender_email = "CouchPotatoesDoNotReply@gmail.com"
    receiver_email = user_email
    password = "passWord@123"

    email = MIMEMultipart()
    email["From"] = sender_email
    email["To"] = receiver_email
    email["Subject"] = subject
    email.attach(MIMEText(body, "plain"))

    session = smtplib.SMTP('smtp.gmail.com', 587)
    session.starttls()
    session.login(sender_email, password)
    text = email.as_string()
    session.sendmail(sender_email, receiver_email, text)
    session.quit()