import Cookies from 'js-cookie';
let backendHost = 'http://127.0.0.1:8000/';
var module = {};

export default function api() {
    function send(method, url, body = null, callback = null) {
        let req = null;
        let finResponse = {res: null, data: null, err: null};
        if (body === null) {
            req = {
                method,
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            }
        } else {
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
        return send('post', `${backendHost}accounts/login`, bodyValues, callback);
    };

    module.logout = function (callback) {
        return send('post', `${backendHost}accounts/logout`, null, callback);
    };

    module.postUserShowList = function(data, callback){
        return send('post', `${backendHost}profiles/ShowList`, data, callback);
    };

    module.patchUserShowWatchStatus = function(data, callback){
        return send('patch', `${backendHost}profiles/ShowStatus`, data, callback);
    };

    module.getUserShowWatchStatus = function(showId, callback){
        return send('get', `${backendHost}profiles/ShowStatus?show_id=${showId}`, null, callback);
    };

    module.patchUserEp = function(data, callback){
        return send('patch', `${backendHost}profiles/ShowEpisode`, data, callback);
    };

    return module;
}
