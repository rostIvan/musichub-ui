loadLessonsPage();

$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 1) {
        console.log('end11');
    }
});

function loadLessonsPage(url) {
    let lessonUrl = url == null ? baseUrl + `lessons/?page=1` : url;
    $.ajax({
        type: "GET",
        url: lessonUrl,
        headers: optionalJWT(),
        dataType: "json",
        success: function (data) {
            console.log(data);
            let lessons = data['results'];
            lessons.forEach((lesson) => {
                // console.log(lesson);
                addLessonRow(
                    lesson['title'],
                    lesson['user']['email'],
                    lesson['likes_count'],
                    lesson['like'],
                    lesson['mine']
                )
            })
        },
        error: function (err) {
            console.log(err);
            updateAccessToken();
        }
    });
}

function addLessonRow(title, user, likes_count, like, mine) {
    let lessons = document.getElementById('lessons-container');
    let div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = buildCard(title, user, likes_count, like, mine);
    lessons.appendChild(div);
}

function optionalJWT() {
    let accessToken = localStorage.getItem('access-token');
    // console.log({'access': accessToken});
    if (accessToken != null) {
        return {
            'Authorization': `JWT ${accessToken}`,
            'Content-Type': 'application/json'
        };
    }
    return {}
}

function buildCard(title, user, likes_count, like, mine) {
    console.log(like, mine);
    let titleHTML = `<div class="card-body ">
                        <h4 class="card-title">
                            <a href="#">${title}</a>
                        </h4>
                    </div>`;

    let editHTML = `${mine ? '<i id="edit-icon" class="material-icons noselect">edit</i>': ''}`;
    let likeHTML = `<i id="like-icon" class="material-icons noselect ${like ? 'primary-purple' : ''}">favorite</i> ${likes_count}`
    let stats = editHTML + likeHTML;

    return titleHTML +
            `<div class="card-footer ">
                <div class="author">
                    <a href="#">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png" alt="avatar" class="avatar img-raised">
                        <span>${user}</span>
                    </a>
                </div>
                <div class="stats ml-auto">
                    ${stats}
                </div>
            </div>`;
}
