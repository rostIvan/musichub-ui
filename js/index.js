let nextPage = null;
let lessonIcons = $('#lessons-container');
let lessonAddBtn = $('#lesson-add-btn');


loadLessonsPage(`${baseUrl}/lessons/?page=1`);

if (isAuthenticated()) {
    lessonAddBtn.removeClass('d-none');
}

$(window).scroll(function () {
    if (scrolledToDown()) {
        paginate(nextPage)
    }
});

lessonAddBtn.click(() => {
   alert('Add')
});

lessonIcons.on('click', '.like-icons', (e) => {
    let id = getLessonId(e);
    if (id != null) {
        likeToggle(id)
    }
});

lessonIcons.on('click', '.edit-icons', (e) => {
    let id = getLessonId(e);
    alert(id);
});


function paginate(next) {
    if (next != null) {
        console.log('paginate');
        loadLessonsPage(next);
    }
}

function addLike(id) {
    $(`#like-icon_${id}`).addClass('primary-purple');
    let likesCount = $(`#likes-count_${id}`);
    let count = Number(likesCount.text());
    likesCount.text(count + 1)
}

function removeLike(id) {
    $(`#like-icon_${id}`).removeClass('primary-purple');
    let likesCount = $(`#likes-count_${id}`);
    let count = Number(likesCount.text());
    likesCount.text(count - 1)
}

function likeToggle(id) {
    $.ajax({
        type: "POST",
        headers: optionalJWT(),
        url: `${baseUrl}/lessons/${id}/likes/`,
        statusCode: {
            201: () => {
                addLike(id)
            },
            204: () => {
                removeLike(id)
            }
        }
    })
}

function loadLessonsPage(url) {
    $.ajax({
        type: "GET",
        url: url,
        headers: optionalJWT(),
        dataType: "json",
        success: function (data) {
            console.log(data);
            nextPage = data['next'];
            data['results'].forEach((lesson) => {
                addLessonRow(
                    lesson['id'], lesson['title'], lesson['user']['email'],
                    lesson['likes_count'], lesson['like'], lesson['mine']
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
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = buildCard(lessonId, title, user, likesCount, like, mine);
    $('#lessons-container').append(card);
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
    let ref = `../html/lesson.html#${lessonId}`;
    let editHTML = '<div class="edit-icons">' +
        `${mine ? `<i id="edit-icon_${lessonId}" class="material-icons">edit</i>` : ''}` +
        '</div>';
    let likeHTML = `<div class="like-icons">` +
        `<i id="like-icon_${lessonId}" class="material-icons ${like ? 'primary-purple' : ''}">favorite</i>
                            <span id="likes-count_${lessonId}"> ${likesCount} </span>` +
        '</div>';

    return `<div class="card-body ">
                <h4 class="card-title">
                    <a href="${ref}">${title}</a>
                </h4>
            </div>
            <div class="card-footer ">
                <div class="author">
                    <a href="${ref}">
                        <i class="material-icons">account_circle</i>
                        <span>${user}</span>
                    </a>
                </div>
                <div class="stats ml-auto noselect">
                    ${editHTML + likeHTML}
                </div>
            </div>`;
}

function getLessonId(e) {
    [_, id] = e.target.id.split('_');
    return id
}

function scrolledToDown() {
    return $(window).scrollTop() + $(window).height() > $(document).height() - 1;
}