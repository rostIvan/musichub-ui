loadLessonsPage();

$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 1) {
        console.log('end11');
    }
});

$('#lessons-container').on('click', '.like-icons', (e) => {
    let id = getLessonId(e);
    likeToggle(id)
});

$('#lessons-container').on('click', '.edit-icons', (e) => {
    let id = getLessonId(e);
    alert(id);
});


function addLike(id) {
    let selector = `#like-icon_${id}`;
    console.log(selector);
    $(selector).addClass('primary-purple');
    console.log('add')
}

function removeLike(id) {
    $(`#like-icon_${id}`).removeClass('primary-purple');
    console.log('remove')
}

function likeToggle(id) {
    $.ajax({
        type: "POST",
        headers: optionalJWT(),
        url: `${baseUrl}/lessons/${id}/likes/`,
        statusCode: {
            201: () => { addLike(id) },
            204: () => { removeLike(id) }
        }
    })
}

function loadLessonsPage(url) {
    let lessonUrl = url == null ? `${baseUrl}/lessons/?page=1` : url;
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
                    lesson['id'],
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

function addLessonRow(lessonId, title, user, likesCount, like, mine) {
    let lessons = document.getElementById('lessons-container');
    let div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = buildCard(lessonId, title, user, likesCount, like, mine);
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

function buildCard(lessonId, title, user, likesCount, like, mine) {
    let titleHTML = `<div class="card-body ">
                        <h4 class="card-title">
                            <a href="#">${title}</a>
                        </h4>
                    </div>`;

    let editHTML = `${mine ? `<i id="edit-icon_${lessonId}" class="edit-icons material-icons">edit</i>` : ''}`;
    let likeHTML = `<i id="like-icon_${lessonId}" 
                        class="like-icons material-icons ${like ? 'primary-purple' : ''}">favorite</i> ${likesCount}`;
    let stats = editHTML + likeHTML;

    return titleHTML +
        `<div class="card-footer ">
                <div class="author">
                    <a href="#">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png" alt="avatar" class="avatar img-raised">
                        <span>${user}</span>
                    </a>
                </div>
                <div class="stats ml-auto noselect">
                    ${stats}
                </div>
            </div>`;
}


function getLessonId(e) {
    [_, id] = e.target.id.split('_');
    return id
}
