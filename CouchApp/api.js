
export const hostURL = 'https://couch-potatoes.live'
//export const hostURL = 'http://192.168.2.37:8000'

export default function api(csrftoken) {
    var module = {};
    function send(method, url, body = null, callback = null, isMultipart = false) {
        let req = null;
        let finResponse = { res: null, data: null, err: null };
        if (body === null) {
            req = {
                method,
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': csrftoken,
                    'Referer': 'https://couch-potatoes.live'
                }
            }
        } else if (isMultipart) {
            req = {
                method,
                credentials: 'include',
                headers: {
                    "content-type": "multipart/form-data",
                    'X-CSRFToken': csrftoken,
                    'Referer': 'https://couch-potatoes.live'
                },
                body,
            }
        } else {
            req = {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'Referer': 'https://couch-potatoes.live'
                },
                body: JSON.stringify(body),
            }
        }
        return fetch(url, req)
            .then((response) => {
                finResponse.res = response;
                return response.json();
            })
            .then((data) => {
                if (callback != null) {
                    finResponse.data = data;
                    callback(finResponse);
                    return Promise.resolve();
                }
            })
            .catch((err) => {
                // console.error(err)
                if (callback != null) {
                    finResponse.err = err;
                    callback(finResponse);
                }
            });
    }

    module.getCSRFToken = function (callback) {
        send('get', `${hostURL}/accounts/csrf`, null, callback);
    };

    module.signup = function (bodyValues, callback) {
        send('post', `${hostURL}/accounts/signup`, bodyValues, callback, true);
    };

    module.login = function (bodyValues, callback) {
        send('post', `${hostURL}/accounts/login`, bodyValues, callback);
    };

    module.logout = function (callback) {
        send('post', `${hostURL}/accounts/logout`, null, callback);
    };

    module.search = function (searchQuery, callback) {
        send('get', `${hostURL}/shows/Search?q=${searchQuery}`, null, callback);
    };

    module.getPopularShows = function (callback) {
        send('get', `${hostURL}/shows/PopularShows`, null, callback);
    };

    module.getShowImage = function (showId, callback) {
        return send('get', `${hostURL}/shows/ShowImage?show_id=${showId}`, null, callback);
    };

    module.getShowInfo = function (showId, callback) {
        return send('get', `${hostURL}/shows/Information?show_id=${showId}`, null, callback);
    };

    module.getEpisodeTotal = function (callback) {
        return send('get', `${hostURL}/shows/Episodes`, null, callback);
    };

    module.getUserShows = function (callback) {
        return send('get', `${hostURL}/profiles/ShowList`, null, callback);
    };

    module.getUserPicture = function (callback) {
        return send('get', `${hostURL}/profiles/Picture`, null, callback);
    };

    module.deleteShowStatus = function (showId, callback) {
        return send('delete', `${hostURL}/profiles/ShowList?show_id=${showId}`, null, callback);
    };

    module.getShowStatus = function (showId, callback) {
        return send('get', `${hostURL}/profiles/ShowStatus?show_id=${showId}`, null, callback);
    };

    module.getUserProfile = function (callback) {
        return send('get', `${hostURL}/profiles/Profile`, null, callback);
    };

    module.patchUserEp = function (data, callback) {
        return send('patch', `${hostURL}/profiles/ShowEpisode`, data, callback);
    };

    module.postUserShowList = function (data, callback) {
        return send('post', `${hostURL}/profiles/ShowList`, data, callback);
    };

    module.patchUserShowWatchStatus = function (data, callback) {
        return send('patch', `${hostURL}/profiles/ShowStatus`, data, callback);
    };

    module.getReviews = function (showId, callback) {
        return send('get', `${hostURL}/reviews/ShowReviews?show_id=${showId}`, null, callback);
    };

    return module;
}

