import requests
from django.contrib.auth.models import User
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from json import loads

from .models import UserProfile, AbstractShow

from .seralizers import ProfileSerializer
from CouchPotatoesApi import constants
from shows.models import Show
from shows.views import set_tvdb_auth_token


class ShowListView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def post(self, request, format=None):
        try:
            if request.user.is_authenticated:
                user = request.user
                show_id = request.data["show_id"]
                try:
                    watch_status = AbstractShow.WatchStatus(int(request.data["status"]))
                except:
                    return Response(status=status.HTTP_400_BAD_REQUEST, data="Invalid Watch Status")

                profile = UserProfile.objects.get(user=user)
                curr_show = [s for s in profile.show_list if s['id'] == show_id]
                if len(curr_show) > 0:
                    return Response(status=status.HTTP_409_CONFLICT, data="Show already exists in user list")

                if Show.objects.filter(show_id=int(show_id)).exists():
                    show = Show.objects.get(show_id=int(show_id))
                    show.num_watchers += 1
                    show_name = show.name
                    show.save()
                else:
                    (num_episodes, avg_runtime, show_name) = show_info(show_id)
                    show = Show(show_id=show_id, num_episodes=num_episodes, avg_runtime=avg_runtime, name=show_name)
                    show.save()
                ep_number = 0
                if watch_status == 2:
                    profile.total_watch_time += show.avg_runtime * show.num_episodes
                    ep_number = show.num_episodes
                profile.show_list.append(
                    {"id": show_id, "name": show_name, "status": watch_status, "ep_number": ep_number})
                profile.save()
                return Response(status=status.HTTP_201_CREATED, data="Added new show to library")

            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED, data="Access Denied")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")

    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            if request.user.is_authenticated:
                user = request.user
                profile = UserProfile.objects.get(user=user)
                return Response(data=profile.show_list[::-1], status=status.HTTP_200_OK)

            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED, data="Access Denied")

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")

    def delete(self, request, format=None):
        try:
            if request.user.is_authenticated:
                profile = UserProfile.objects.get(user=request.user)
                show_id = request.query_params['show_id']
                user_shows = profile.show_list
                try:
                    user_show = [s for s in user_shows if s['id'] == show_id][0]
                except:
                    return Response("Show Not Found", status=status.HTTP_404_NOT_FOUND)
                user_shows.pop(user_shows.index(user_show))
                show = Show.objects.get(show_id=int(user_show['id']))
                time_reduction = user_show["ep_number"] * show.avg_runtime
                profile.total_watch_time = profile.total_watch_time - time_reduction if profile.total_watch_time - time_reduction >= 0 else 0
                profile.total_watch_time = round(profile.total_watch_time, 2)
                show.num_watchers -= 1
                profile.save()
                show.save()
                return Response(status=status.HTTP_200_OK, data="Show Deleted")

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class UserProfileView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            if request.user.is_authenticated:
                profile = UserProfile.objects.get(user=request.user)
                return Response(status=status.HTTP_200_OK, data=ProfileSerializer(profile).data)
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED, data="Access Denied")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class ShowStatusView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def patch(self, request, format=None):
        try:
            if request.user.is_authenticated:
                profile = UserProfile.objects.get(user=request.user)
                show_id = request.data['show_id']
                try:
                    watch_status = AbstractShow.WatchStatus(int(request.data["status"]))
                except:
                    return Response(status=status.HTTP_400_BAD_REQUEST, data="Invalid Watch Status")
                user_shows = profile.show_list
                try:
                    show = [s for s in user_shows if s['id'] == show_id][0]
                except:
                    return Response("Show Not Found", status=status.HTTP_404_NOT_FOUND)
                show["status"] = watch_status
                if watch_status == 2:
                    show_obj = Show.objects.get(show_id=show_id)
                    if show_obj.num_episodes > 0:
                        if profile.total_watch_time >= show["ep_number"] * show_obj.avg_runtime:
                            profile.total_watch_time -= show["ep_number"] * show_obj.avg_runtime
                        else:
                            profile.total_watch_time = 0
                        profile.total_watch_time += show_obj.avg_runtime * show_obj.num_episodes
                        show["ep_number"] = show_obj.num_episodes
                profile.save()
                return Response(status=status.HTTP_200_OK, data="Status Modified")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")

    @method_decorator(csrf_protect, name='dispatch')
    def get(self, request, format=None):
        try:
            if request.user.is_authenticated:
                profile = UserProfile.objects.get(user=request.user)
                show_id = request.query_params['show_id']
                user_shows = profile.show_list
                try:
                    show = [s for s in user_shows if s['id'] == show_id][0]
                except:
                    return Response("Show Not Found", status=status.HTTP_404_NOT_FOUND)
                return Response(status=status.HTTP_200_OK, data={"watch_status": show["status"]})

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


class ShowEpisodeView(APIView):
    @method_decorator(csrf_protect, name='dispatch')
    def patch(self, request, format=None):
        try:
            if request.user.is_authenticated:
                profile = UserProfile.objects.get(user=request.user)
                show_id = request.data['show_id']
                ep_number = int(request.data["ep_number"])
                user_shows = profile.show_list
                ep_number = 0 if ep_number < 0 else ep_number

                try:
                    show = [s for s in user_shows if s['id'] == show_id][0]
                except:
                    return Response("Show Not Found", status=status.HTTP_404_NOT_FOUND)
                show_obj = Show.objects.get(show_id=show_id)

                if profile.total_watch_time >= show["ep_number"] * show_obj.avg_runtime:
                    profile.total_watch_time -= show["ep_number"] * show_obj.avg_runtime
                else:
                    profile.total_watch_time = 0

                profile.total_watch_time += show_obj.avg_runtime * ep_number
                show["status"] = 1 if show["status"] != 1 and show['ep_number'] != ep_number else show['status']
                show["status"] = 0 if ep_number == 0 and show["ep_number"] > 0 else show['status']
                show["ep_number"] = ep_number
                profile.total_watch_time = round(profile.total_watch_time, 2)
                profile.save()
                return Response(status=status.HTTP_200_OK, data="Episode set")
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")


@method_decorator(csrf_protect, name='dispatch')
class ProfilePictureView(APIView):
    def post(self, request, format=None):
        try:
            file = request.data['file']
            profile = UserProfile.objects.get(user=request.user)
            profile.profile_picture = file
            profile.save()
            return Response("Image Uploaded", status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Internal Server Error")

    def get(self, request, format=None):
        try:
            profile = UserProfile.objects.get(user=request.user)
            if profile.profile_picture:
                return Response(profile.profile_picture.url, status=status.HTTP_200_OK)
            else:
                return Response("No Picture Found", status=status.HTTP_404_NOT_FOUND)
        except:
            return Response("Internal Server Error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_protect, name='dispatch')
class UserProfilePictureView(APIView):
    def get(self, request, format=None):
        try:
            curr_user = User.objects.get(username=request.query_params["username"])
            profile = UserProfile.objects.get(user=curr_user)
            if profile.profile_picture:
                return Response(profile.profile_picture.url, status=status.HTTP_200_OK)
            else:
                return Response("No Picture Found", status=status.HTTP_404_NOT_FOUND)
        except:
            return Response("Internal Server Error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def show_info(show_id):
    num_eps = 0
    runtimes = []
    set_tvdb_auth_token()
    r = requests.get(f"https://api4.thetvdb.com/v4/series/{show_id}/extended",
                     headers={"Authorization": constants.TVDB_TOKEN})
    data = loads(r.content)['data']
    seasons = data["seasons"]
    name = data["name"]
    for season in seasons:
        if season["type"]["id"] == 3:
            s_eps, s_runtimes = _season_info(season)
            num_eps += s_eps
            runtimes += s_runtimes

    # If the series has no absolute order episode info check aired order
    if num_eps == 0:
        for season in seasons:
            if season["type"]["id"] == 1:
                s_eps, s_runtimes = _season_info(season)
                num_eps += s_eps
                runtimes += s_runtimes
    if len(runtimes) > 0:
        return num_eps, round(sum(runtimes) / len(runtimes), 2), name
    return num_eps, 0, name


def _season_info(season):
    num_eps = 0
    runtimes = []
    r = requests.get(f"https://api4.thetvdb.com/v4/seasons/{season['id']}/extended",
                     headers={"Authorization": constants.TVDB_TOKEN})

    season_episodes = loads(r.content)["data"]["episodes"]
    ep_ids = set()
    for ep in season_episodes:
        if ep["id"] not in ep_ids:
            ep_ids.add(ep["id"])
            num_eps += 1
            runtimes.append(ep['runtime'])
    return num_eps, runtimes
