let baseUrl = 'http://localhost:8000/';
let tokenUrl = baseUrl + 'auth/token/';
let isAuth = isAuthenticated();
console.log(`base url = ${baseUrl}`);
console.log(`is auth = ${isAuth}`);

$(document).ready(function () {
    const MINUTES = 60 * 1000;
    if (hasRefreshToken()) {
        setInterval(function () {
            updateAccessToken();
        }, 3 * MINUTES);
    }
});

if (isAuth) {
    $('#authorized-navbar').show();
    $('#unauthorized-navbar').hide()
}
else {
    $('#authorized-navbar').hide();
    $('#unauthorized-navbar').show()
}

$('#logout').click(() => {
    clearTokenPairs()
});

// Showdown usage:
//   var text = "Markdown *rocks*. ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png \"Logo Title Text 1\")\n";
//   var converter = new showdown.Converter();
//   var html = converter.makeHtml(text);
//   alert(html);


function obtainToken(email, password, request) {
    var onSuccess = request['success'];
    $.ajax({
        type: "POST",
        url: tokenUrl + 'obtain/',
        data: JSON.stringify({'email': email, 'password': password}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            storeTokenPairs(data);
            onSuccess(data);
        },
        error: request['error']
    });
}

function refreshAccessToken(refresh, request) {
    let onSuccess = request['success'];
    $.ajax({
        type: "POST",
        url: tokenUrl + 'refresh/',
        data: JSON.stringify({'refresh': refresh}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            localStorage.setItem('access-token', data['access']);
            onSuccess(data)
        },
        error: request['error']
    });
}

function storeTokenPairs(data) {
    let access = data['access'];
    let refresh = data['refresh'];
    localStorage.setItem('access-token', access);
    localStorage.setItem('refresh-token', refresh);
}

function clearTokenPairs() {
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
}

function apiCall(accessToken, request) {
    let onSuccess = request['success'];
    let onError = request['error'];
    let jsonData = request['data'];

    $.ajax({
        type: request['type'],
        url: request['url'],
        data: JSON.stringify(jsonData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: onSuccess,
        error: function (err) {
            console.log(err);
            if (err.status === 401) {
                refreshAccessToken(localStorage.getItem('refresh-token'), {
                    success: function () {
                        $.ajax({
                            type: request['type'],
                            url: request['url'],
                            data: JSON.stringify(jsonData),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: onSuccess,
                            error: function (err) {
                                console.log('Error: ' + err);
                                onError(err)
                            }
                        })
                    },
                    error: function (err) {
                        console.log('Log in, again: ' + err.status);
                        clearTokenPairs();
                        window.location.replace("../html/sign-in.html");
                    }
                })
            }
            else {
                console.log('onError: ' + err.status);
                onError(err)
            }
        }
    });
}


function updateAccessToken() {
    refreshAccessToken(localStorage.getItem('refresh-token'), {
        success: function (data) {
            console.log(data)
        },
        error: function (err) {
            console.log(err.status);
            clearTokenPairs();
            if (!isSignInWindow()) {
                window.location.replace("../html/sign-in.html");
            }
        }
    });
}

function isAuthenticated() {
    let access = localStorage.getItem('access-token');
    let refresh = localStorage.getItem('refresh-token');
    return access != null && refresh != null;
}

function hasRefreshToken() {
    return localStorage.getItem('refresh-token') != null;
}

function isSignInWindow() {
    return window.location.pathname.includes('sign-in.html')
}