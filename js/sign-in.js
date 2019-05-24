$('#sign-in-btn').click(function () {
    var email = $("input[name='email']").val();
    var password = $("input[name='password']").val();
    console.log('Email: ' + email);
    console.log('Password: ' + password);

    obtainToken(email, password, {
            success: function (data) {
                console.log({access:  data['access'], refresh: data['refresh']});
                storeTokenPairs(data);
                // alert('Access: ' + data['access'] + '\nRefresh: ' + data['refresh'])
                window.location.replace("../html/index.html");
            },
            error: function (err) {
                console.log(err);
                alert('Status: ' + err.status + ' response: ' + err.responseText);
            }
        }
    );
});
