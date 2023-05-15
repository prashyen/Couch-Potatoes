import Cookies from 'js-cookie';

export default function api() {
    // let backendHost = window.location.origin +  "/";
    let backendHost = 'http://127.0.0.1:8000/';
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
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            }
        } else if(isMultipart){
            req = {
                method,
                credentials: 'include',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                },
                body,
            }
        }else {
            req = {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Cookies.get('csrftoken')
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
                if (callback != null) {
                    finResponse.err = err;
                    callback(finResponse);
                }
            });
    }

    module.getCSRFToken = function (callback) {
        return send('get', `${backendHost}accounts/csrf`, null, callback);
    };

    module.login = function (bodyValues, callback) {
        return send('post', `${backendHost}accounts/login`, bodyValues, callback, true);
    };

    module.logout = function (callback) {
        return send('post', `${backendHost}accounts/logout`, null, callback);
    };

    module.getShowTotalEpisodes = function (callback) {
        return send('get', `${backendHost}shows/Episodes`, null, callback);
    };
    module.getShowInfo = function(showId, callback){
        return send('get', `${backendHost}shows/Information?show_id=${showId}`, null, callback);
    };
    module.getUserShows = function (callback) {
        return send('get', `${backendHost}profiles/ShowList`, null, callback);
    };
    module.getUserProfile = function(callback){
        return send('get', `${backendHost}profiles/Profile`, null, callback);
    };
    module.patchUserEp = function(data, callback){
        return send('patch', `${backendHost}profiles/ShowEpisode`, data, callback);
    };
    module.patchUserShowWatchStatus = function(data, callback){
        return send('patch', `${backendHost}profiles/ShowStatus`, data, callback);
    };
    module.getUserShowWatchStatus = function(showId, callback){
        return send('get', `${backendHost}profiles/ShowStatus?show_id=${showId}`, null, callback);
    };

    return module;
}
