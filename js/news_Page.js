function LoadNews() {
    fetch("https://sas.front.kreosoft.space/api/News")
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((json) => {
            console.log(json);
            $("#all_news").empty();                            
            $template = $("#news-template");
            for (var news of json) {
                $newsCard = $template.clone();
                $newsCard.removeClass("d-none");
                $newsCard.attr("id", "newNumber" + news.id);
                $newsCard.find(".header-btn").attr("data-target","#news-" + news.id);
                $newsCard.find(".news-title").text(news.title);
                $newsCard.find(".news-tags").text(news.tags);
                $newsCard.find(".news-collapse").attr("id", "news-" + news.id);
                $newsCard.find(".news-content").text(news.content);
                $newsCard.find(".news-date").text(getFormattedDate(news.date));
                $newsCard.find(".news-likes").text(news.serviceInfo.likes);
                $newsCard.find(".fa-heart")[0].addEventListener("click", function() {
                    let index = $(this).index(".fa-heart");
                    post('https://sas.front.kreosoft.space/api/News/like', {id : index + 1})
                    .then(() => {
                        LoadNews();
                    })      
                    .catch(error => console.error(error))
                });
                $("#all_news").append($newsCard);
            }
        })
        .catch(error => console.error(error));
}

function getFormattedDate(datetime) {
    var date = new Date(datetime);
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return day + '.' + month + '.' + year;
}

function post(url, data) {
    return fetch(url, {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify(data), 
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    })
}

$(document).ready(function() {
    LoadNews();
})



