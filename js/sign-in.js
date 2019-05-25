$('#sign-in-btn').click(() => {
    let email = $("input[name='email']").val();
    let password = $("input[name='password']").val();
    console.log('Email: ' + email);
    console.log('Password: ' + password);

    obtainToken(email, password, {
            success: (data) => {
                console.log({access: data['access'], refresh: data['refresh']});
                storeTokenPairs(data);
                // alert('Access: ' + data['access'] + '\nRefresh: ' + data['refresh'])
                window.location.replace("../html/index.html");
            },
            error: (err) => {
                console.log(err);
                alert('Status: ' + err.status + ' response: ' + err.responseText);
            }
        }
    );
});
