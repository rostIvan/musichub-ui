$('#sign-up-btn').click(function () {
    let email = $("input[name='email']").val();
    let password = $("input[name='password']").val();
    console.log('Email: ' + email);
    console.log('Password: ' + password);

    signUpCall(email, password,
        (data) => {
            console.log(data);
            alert('Check your email ' + data['email']);
            window.location.replace("../html/sign-in.html");
        },
        (err) => {
            console.log(err);
            alert('Status: ' + err.status + ' response: ' + err.responseText);
        }
    );
});

function signUpCall(email, password, success, error) {
    $.ajax({
        type: "POST",
        url: `${baseUrl}/auth/sign-up/`,
        data: JSON.stringify({'email': email, 'password': password}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: success,
        error: error
    });
}
