# Couch Potatoes REST API Documentation

## Accounts API

### Signup

- description: create a new user account
- request: `POST /accounts/signup/`
    - content-type: `multipart/form-data`
    - body: object
      - username: (string) the username of user
      - password: (string) the corresponding password
      - email: (string) users email
      - first_name: (string) first name of user
      - last_name: (string) last name of user
      - file: (file) users profile picture
- response: 201
    - content-type: `application/json`
    - body: Success
- response: 409
    - content-type: `application/json`
    - body: Username already exists
- response: 409
    - content-type: `application/json`
    - body: E-mail already in use

``` 
$ curl -X POST
       -H Content-Type="multipart/form-data"
       -H "Referer: https://couch-potatoes.live" 
	   -H "X-CSRFToken: {token}"  
       -F username="jd"
       -F password="pass4jd"
       -F email="jd@gmail.com"
       -F first_name="John"
       -F last_name="Doe"
       -F 'file=@\path\to\file\Downloads\ImageFileName.png'
       https://couch-potatoes.live/accounts/signup
```

### Login

- description: login to account
- request: `POST /accounts/login/`
    - content-type: `multipart/form-data`
    - body: object
      - username: (string) the username of user
      - password: (string) the corresponding password
- response: 201
    - content-type: `application/json`
    - body: Success
- response: 401
    - content-type: `application/json`
    - body: Invalid Credentials

``` 
$ curl -X POST
       -H Content-Type="multipart/form-data"
       -H "Referer: https://couch-potatoes.live" 
	   -H "X-CSRFToken: {token}"  
       -F username="jd"
       -F password="pass4jd"
       https://couch-potatoes.live/accounts/login
```

### isAuthenticated

- description: check if user is authenticated
- request: `GET /accounts/isAuthenticated/`  
- response: 200
    - content-type: `application/json`
    - body: 
      - isAuthenticated: (string) success
- response: 401
    - content-type: `application/json`
    - body: 
      - isAuthenticated: (string) error
 
``` 
curl 
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/accounts/isAuthenticated
``` 

### Logout

- description: Log the user out
- request: `POST /accounts/logout/`  
- response: 200
    - content-type: `application/json`
    - body: success
 
``` 
curl -X POST 
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/accounts/logout
``` 

### CSRF Token

- description: Retrieve CSRF token
- request: `GET /accounts/csrf/`  
- response: 200
    - content-type: `application/json`
    - body: CSRF Cookie Set
 
``` 
curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	https://couch-potatoes.live/accounts/csrf
``` 

## Reviews API

### Review

- description: creates a new review for a shows
- request: `POST /reviews/Review/`
    - content-type: `application/json`
    - body: object
      - show_id: (int) the id of the show
      - comment: (string) the comment for the show
      - rating: (int) a rating out of five
- response: 201
    - content-type: `application/json`
    - body: Review Added
- response: 404
    - body: Show not found

``` 
$ curl -X POST
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
    -d '{"comment": "hello world", "rating": 3, "show_id": 14526}'
	https://couch-potatoes.live/reviews/Review

```

- description: creates a new review for show id
- request: `DELETE /reviews/Review?show_id=id`
    - content-type: `application/json`
    - body: object
      - show_id: (int) the id of the show
- response: 201
    - content-type: `application/json`
    - body: Review Deleted
- response: 404
    - body: Show not found
- response: 404
    - body: Review Not Found

``` 
$ curl -X DELETE
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/reviews/Review/?show_id=14256

```

### ShowReviews

 description: retrieves the reviews for a specific show_id id
- request: `GET /reviews/ShowReviews?show_id=id`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: (int) the review id
      - show_id: (int) the show id
      - username: (string) the authors name
      - comment: (string) the comment/review
      - rating:  (int) a rating value between 0 and 5
      - last_modified: (string) the date when the review was last modified
- response: 404
    - body: Show not found
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/reviews/ShowReviews/?show_id=14256
``` 


### ShowRating

 description: retrieves the ratings for a specific show_id id
- request: `GET /reviews/ShowRating?show_id=id`   
- response: 200
    - content-type: `application/json`
    - body: object
      - rating:  (int) a rating value between 0 and 5
- response: 404
    - body: Show not found
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/reviews/ShowRating/?show_id=14256
``` 

## Shows API

### Search

 description: retrieves the shows with names matching the query q
- request: `GET /shows/Search?q=searchquery`   
- response: 200
    - content-type: `application/json`
    - body: list of object
      - aliases:  (list of string) alias names for the show
      - country: (string) country show belongs to
      - id: (string) series id
      - image_url: (string) show poster image url
      - name: (string) name of show
      - name_translated: (object) translated show names
      - network: (string) network the roduces the show
      - overview: (string) overview/description of the show
      - overview_translated: (Object) translated description
      - primary_language: (string) the primary language of the show
      - status: (string) the current status of the show
      - type: (string) the type of show
      - year: (string) the year the show was released
- response: 404
    - body: Show not found
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/Search/?q=outpost
``` 


### ShowInfo

description: retrieves the show info for show id
- request: `GET /shows/Information?show_id=id`   
- response: 200
    - content-type: `application/json`
    - body: object
        - cpdb: (object)
            - avg_runtime: (int) average show runtime
            - id: (string) cpdb show id
            - name: (string) show name
            - num_episodes: (int) total number of episodes for show id
            - num_watchers: (int) number of users watching this show
            - rating: (int) show rating
            - show_id: (int) corresponding tvdb show id
        - tvdb: (object)
            - aliases:  (list of string) alias names for the show
            - airtime: (string) the air time of the show
            - airtime: (object) the days in a week the show is aired
            - country: (string) country show belongs to
            - id: (string) series id
            - image_url: (string) show poster image url
            - name: (string) name of show
            - name_translated: (object) translated show names
            - network: (string) network the roduces the show
            - overview: (string) overview/description of the show
            - overview_translated: (Object) translated description
            - primary_language: (string) the primary language of the show
            - status: (string) the current status of the show
            - type: (string) the type of show
            - year: (string) the year the show was released
- response: 404
    - body: Show not found
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/Information/?show_id=14256
``` 


### BrowseShows

description: retrieves 100 shows per pages in random order
- request: `GET /shows/BrowseShows/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
            - aliases:  (list of string) alias names for the show
            - airtime: (string) the air time of the show
            - airtime: (object) the days in a week the show is aired
            - country: (string) country show belongs to
            - id: (string) series id
            - image_url: (string) show poster image url
            - name: (string) name of show
            - name_translated: (object) translated show names
            - network: (string) network the roduces the show
            - overview: (string) overview/description of the show
            - overview_translated: (Object) translated description
            - primary_language: (string) the primary language of the show
            - status: (string) the current status of the show
            - type: (string) the type of show
            - year: (string) the year the show was released
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/BrowseShows/
``` 

### PopularShows

description: retrieves 6 most popular or highly rated shows ordred by num of watchers/rating value
- request: `GET /shows/PopularShows[?rated=True]`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
            - avg_runtime: (int) average show runtime
            - id: (string) cpdb show id
            - name: (string) show name
            - num_episodes: (int) total number of episodes for show id
            - num_watchers: (int) number of users watching this show
            - rating: (int) show rating
            - show_id: (int) corresponding tvdb show id
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/PopularShows/?rated=True
``` 

### ShowImage

description: retrieves show post url for show id
- request: `GET /shows/ShowImage?show_id=id`   
- response: 200
    - content-type: `application/json`
    - body: (string) image url
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/ShowImage/?show_id=14256
``` 

### Episodes

description: retrieves the number of episodes for every show in the database or the specific shows if shows with a list of show_ids is provided
- request: `GET /shows/Episodes[?shows=[show_id_1, show_id_2...]]`   
- response: 200
    - content-type: `application/json`
    - body: (object) {show_id_1: num_eps_1, show_id_2: num_eps_2, ...}
- response: 500
    - body: Search Failed
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/shows/Episodes/
``` 

## User Profiles API

## ShowList

- description: Adds a show to the users show list
- request: `POST /profiles/ShowList/`
    - content-type: `application/json`
    - body: object
      - show_id: (int) the id of the show
      - status: (int) the shows current watch status (must be 0, 1 or 2)
- response: 201
    - content-type: `application/json`
    - body: Review Added
- response: 400
    - body: Invalid Watch Status
- response: 401
    - body: Access Denied
- response: 409
    - body: Show already exists in user list

```
$ curl -X POST
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
    -d '{"show_id": "80379", "status": 1}'
	https://couch-potatoes.live/profiles/ShowList

``` 

description: retrieves the current users list of shows
- request: `GET /profiles/ShowList`   
- response: 200
    - content-type: `application/json`
    - body: (object) [{id, name, status, ep_number}]
- response: 401
    - body: Access Denied
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/ShowList/
``` 

description: Deletes a given show from a users list
- request: `DELETE /profiles/ShowList?show_id={id}`   
- response: 200
    - content-type: `application/json`
    - body: Show Deleted
- response: 404
    - body: Show Not Found
 
``` 
$ curl
    -X DELETE      
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/ShowList?show_id=80379
``` 

## Profile
description: Deletes a given show from a users list
- request: `GET /profiles/Profile`   
- response: 200
    - content-type: `application/json`
    - body: (object) 
        {
            id (int): profile id
            email (string): email
            show_list (object): [{id, name, status, ep_number}]
            total_watch_time (float): users total watch time
            first_name (string): users first name
            last_name (string): users last name
        }
 
``` 
$ curl    
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/Profile
```

## ShowStatus 

- description: Modifies a given shows status in the users list
- request: `PATCH /profiles/ShowStatus`
    - content-type: `application/json`
    - body: object
      - show_id: (int) the id of the show
      - status: (int) the shows current watch status (must be 0, 1 or 2)
- response: 200
    - content-type: `application/json`
    - body: Status Modified
- response: 400
    - body: Invalid Watch Status
- response: 404
    - body: Show Not Found

```
$ curl -X PATCH
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
    -d '{"show_id": "80379", "status": 0}'
	https://couch-potatoes.live/profiles/ShowStatus

``` 

description: retrieves the status for a show on the users show list
- request: `GET /profiles/ShowStatus?show_id={id}`   
- response: 200
    - content-type: `application/json`
    - body: {watch_status: (int) watch status}
- response: 404
    - body: Show Not Found
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/ShowStatus?show_id=80379
``` 

## ShowEpisode

- description: Sets the episode number for a show on a users show list will change the status of the show to planning if set to 0 or watching if set to any other number
- request: `PATCH /profiles/ShowEpisode`
    - content-type: `application/json`
    - body: object
      - show_id: (int) the id of the show
      - ep_number: (int) the episode number the user is currently at
- response: 200
    - content-type: `application/json`
    - body: Episode Set
- response: 404
    - body: Show Not Found

```
$ curl -X PATCH
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
    -d '{"show_id": "80379", "ep_number": 10}'
	https://couch-potatoes.live/profiles/ShowEpisode

```

### Picture

- description: Adds a profile picture for the current authenticated user
- request: `POST /profiles/Picture/`
    - content-type: `multipart/form-data`
    - body: object
      - file: (file) users profile picture
- response: 200
    - content-type: `application/json`
    - body: Image Uploaded

``` 
$ curl -X POST
       -H Content-Type="multipart/form-data"
       -H "Referer: https://couch-potatoes.live" 
	   -H "X-CSRFToken: {token}"
       -F 'file=@\path\to\file\Downloads\ImageFileName.png'
       https://couch-potatoes.live/profiles/Picture
```

- description: Gets the current users profile picture if one is available
- request: `GET /profiles/Picture`   
- response: 200
    - content-type: `application/json`
    - body: the url to the users profile picture
- response: 404
    - body: No Picture Found
 
``` 
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/Picture
``` 

## UserPicture

- description: Gets a users profile picture given their username
- request: `GET /profiles/Picture?username={user}`   
- response: 200
    - content-type: `application/json`
    - body: the url to the users profile picture
- response: 404
    - body: No Picture Found
    
```
$ curl
	-H "Content-Type: application/json"
	-H "Referer: https://couch-potatoes.live" 
	-H "X-CSRFToken: {token}"  
	-b cookies.txt -c cookies.txt 
	https://couch-potatoes.live/profiles/Picture?username=jd
``` 