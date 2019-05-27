const id = window.location.hash.substring(1);
console.log(`lesson id = ${id}`);

$.ajax({
    type: "GET",
    url: `${baseUrl}/lessons/${id}`,
    headers: optionalJWT(),
    dataType: "json",
    success: (data) => {
        initLesson(data['title'], data['user']['email'], data['text'])
    },
    error: (err) => {
        console.log(err);
        alert(err)
    }
});

function initLesson(title, author, text) {
    $('#title-text').text(`Title: ${title}`);
    $('#author-text').text(`Author: ${author}`);
    $('#lesson-text').html(markdownToHtml(text));
}

function markdownToHtml(text) {
    let converter = new showdown.Converter();
    return converter.makeHtml(text);
}