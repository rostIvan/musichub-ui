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
    $('#lesson-modal-title').text('Create new lesson');
    $('#lg-modal-window').modal();

    $('#lesson-save-btn').click(() => {
        let {title, text} = lessonFormData();
        createLesson(title, text)
    });
});

lessonIcons.on('click', '.like-icons', (e) => {
    let id = getLessonId(e);
    if (id != null) {
        likeToggle(id)
    }
});

lessonIcons.on('click', '.edit-icons', (e) => {
    let id = getLessonId(e);
    $.ajax({
        type: "GET",
        headers: optionalJWT(),
        url: `${baseUrl}/lessons/${id}/`,
        success: (lesson) => {
            $('#lesson-modal-title').text('Update lesson');
            $('#edit-lesson-title').val(lesson['title']);
            $("#edit-lesson-text-area").val(lesson['text']);
            $('#lg-modal-window').modal();

            $('#lesson-save-btn').click(() => {
                let {title, text} = lessonFormData();
                updateLesson(id, title, text)
            });
        },
        error: (err) => {
            console.log(err);
            alert(err)
        },
    });
});


lessonIcons.on('click', '.delete-icons', (e) => {
    let id = getLessonId(e);
    $.ajax({
        type: "DELETE",
        headers: optionalJWT(),
        url: `${baseUrl}/lessons/${id}/`,
        success: () => {
            removeLesson(id);
            console.log(id)
        },
        error: (err) => {
            console.log(err);
            alert(err);
        }
    })
});

$('#preview-nav-item').click(() => {
    let {_, text} = lessonFormData();
    // Showdown usage:
    let converter = new showdown.Converter();
    let html = converter.makeHtml(text);
    $('#preview-container').html(html);
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


function createLesson(title, text) {
    $.ajax({
        type: "POST",
        url: `${baseUrl}/lessons/`,
        headers: optionalJWT(),
        data: JSON.stringify({'title': title, 'text': text}),
        dataType: "json",
        success: (lesson) => {
            // console.log(lesson);
            startInsertLessonRow(
                lesson['id'], lesson['title'], lesson['user']['email'],
                lesson['likes_count'], lesson['like'], lesson['mine']
            );
            $('#lg-modal-window').modal('hide')
        },
        error: (err) => {
            console.log(err);
            alert(err)
        }
    })
}


function updateLesson(id, title, text) {
    $.ajax({
        type: "PATCH",
        url: `${baseUrl}/lessons/${id}/`,
        headers: optionalJWT(),
        data: JSON.stringify({'title': title, 'text': text}),
        dataType: "json",
        success: (lesson) => {
            console.log(lesson);
            updateLessonRow(lesson['id'], lesson['title']);
            $('#lg-modal-window').modal('hide')
        },
        error: (err) => {
            console.log(err);
            alert(err)
        }
    })
}

function removeLesson(id) {
    $(`#card_${id}`).remove()
}


function updateLessonRow(id, title) {
    $(`#lesson-title_${id}`).text(title)
}

function loadLessonsPage(url) {
    $.ajax({
        type: "GET",
        url: url,
        headers: optionalJWT(),
        dataType: "json",
        success: (data) => {
            console.log(data);
            nextPage = data['next'];
            data['results'].forEach((lesson) => {
                addLessonRow(
                    lesson['id'], lesson['title'], lesson['user']['email'],
                    lesson['likes_count'], lesson['like'], lesson['mine']
                )
            })
        },
        error: (err) => {
            console.log(err);
            updateAccessToken();
        }
    });
}

function addLessonRow(lessonId, title, user, likesCount, like, mine) {
    let card = cardDiv(lessonId, title, user, likesCount, like, mine);
    $('#lessons-container').append(card);
}

function startInsertLessonRow(lessonId, title, user, likesCount, like, mine) {
    let card = cardDiv(lessonId, title, user, likesCount, like, mine);
    $('#lessons-container').prepend((card));
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

function cardDiv(lessonId, title, user, likesCount, like, mine) {
    let card = document.createElement('div');
    card.className = 'card';
    card.id = `card_${lessonId}`;
    card.innerHTML = buildCard(lessonId, title, user, likesCount, like, mine);
    return card;
}

function buildCard(lessonId, title, user, likesCount, like, mine) {
    let ref = `../html/lesson.html#${lessonId}`;
    let editHTML = '<div class="edit-icons">' +
        `${mine ? `<i id="edit-icon_${lessonId}" class="material-icons">edit</i>` : ''}` +
        '</div>';
    let likeHTML = `<div class="like-icons mr-2">` +
        `<i id="like-icon_${lessonId}" class="material-icons ${like ? 'primary-purple' : ''}">favorite</i>
                            <span id="likes-count_${lessonId}"> ${likesCount} </span>` +
        '</div>';
    let deleteHTML = mine ? `<div class="delete-icons">` +
        `<i id="remove-icon_${lessonId}" class="material-icons">close</i>` +
        `</div>` : '';

    return `<div class="card-body ">
                <div class="row">
                    <div class="col">
                        <h4 class="card-title">
                            <a href="${ref}" id="lesson-title_${lessonId}">${title}</a>
                        </h4>
                    </div>
                </div>
            </div>
            <div class="card-footer ">
                <div class="author">
                    <a href="${ref}">
                        <i class="material-icons">account_circle</i>
                        <span>${user}</span>
                    </a>
                </div>
                <div class="stats ml-auto noselect">
                    ${likeHTML + editHTML + deleteHTML}
                </div>
            </div>`;
}

function getLessonId(e) {
    [_, id] = e.target.id.split('_');
    return id
}

function lessonFormData() {
    let title = $("input[name='lesson-title']").val();
    let text = $("textarea[name='lesson-text']").val();
    return {title, text};
}

function scrolledToDown() {
    return $(window).scrollTop() + $(window).height() > $(document).height() - 1;
}

$('#lg-modal-window').on('hidden.bs.modal', () => {
    $('.modal-body').find('textarea,input').val('');
});