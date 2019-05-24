function optionalJWT() {
    let accessToken = localStorage.getItem('access-token');
    console.log(accessToken);
    if (accessToken != null) {
        return {
            'Authorization': `JWT ${accessToken}`,
            'Content-Type': 'application/json'
        };
    }
    return {}
}

$.ajax({
    type: "GET",
    url: baseUrl + 'lessons/',
    headers: optionalJWT(),
    dataType: "json",
    success: function (data) {
        let lessons = data['results'];
        lessons.forEach((lesson) => {
            console.log(lesson);
            addLessonRow(lesson['title'], lesson['user']['email'], lesson['likes_count'])
        })
    },
    error: function (err) {
        console.log(err);
    }
});

function addLessonRow(title, user, likes_count) {
    let lessons = document.getElementById('lessons-container');
    let div = document.createElement('div');
    div.className = 'card';

    div.innerHTML =
        `<div class="card-body ">
                        <h4 class="card-title">
                            <a href="#">${title}</a>
                        </h4>
                    </div>
                    <div class="card-footer ">
                        <div class="author">
                            <a href="#">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png"
                                     alt="avatar" class="avatar img-raised">
                                <span>${user}</span>
                            </a>
                        </div>
                        <div class="stats ml-auto">
                            <i class="material-icons">favorite</i> ${likes_count} &#xB7;
                        </div>
                    </div>`;

    lessons.appendChild(div);
}
