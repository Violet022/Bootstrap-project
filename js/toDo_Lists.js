let userInfo = {
    username: "Violet",
    password: "0vv1o1lt0"
};

let priorities = ["badge-light", "badge-warning", "badge-danger"];
let prioritiesNames = ["Обычный", "Важный", "Критичный"];

let authorizationUrl = "https://sas.front.kreosoft.space/api/auth";

let listsUrl = "https://sas.front.kreosoft.space/api/ToDoList";
let listCreationUrl = "https://sas.front.kreosoft.space/api/ToDoList";
let deleteListUrl = "https://sas.front.kreosoft.space/api/ToDoList";

let itemCreationUrl = "https://sas.front.kreosoft.space/api/ToDoItem";
let checkItemUrl = "https://sas.front.kreosoft.space/api/ToDoItem/check";
let deleteItemUrl = "https://sas.front.kreosoft.space/api/ToDoItem";

let index;


function authorize() {
    fetch(authorizationUrl, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: new Headers({
            "Content-Type": "application/json"
          }),      
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let token = data.accessToken;
        localStorage.setItem("SavedToken", "Bearer " + token);
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

function loadLists() {
    fetch(listsUrl, {
        credentials: "same-origin",
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
          }),      
    })
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        $("#myTab").empty();
        $("#all_lists_tab-content").empty();
        $("#listPriority").empty();
        index = 0;
        if(json.length != 0) {
            $listsNav = $("#lists-navigation-template");
            $listsBody = $(".lists-body-template");

            $listsItemCommon = $(".lists-item-common-template");
            $listsItemDone = $(".lists-item-done-template");
            for (let lists of json) {
                $listsCardBody = $listsBody.clone();
                $listsCardBody.removeClass("d-none");
                $listsCardBody.attr("id", "listNumber" + lists.id);
                $listsCardBody.find(".list-delete-button")[0].addEventListener("click", function() {
                    sendRequest(deleteListUrl, "DELETE", {
                        id: lists.id
                    })
                });
                $listsCardBody.find(".lists-name").text("Список дел №" + (index + 1) + " - " + lists.name);
                if(index == 0) {
                    $listsCardBody.addClass("show");
                    $listsCardBody.addClass("active");
                }

                $listsCardNav = $listsNav.clone();
                $listsCardNav.removeClass("d-none");
                $listsCardNav.find(".lists-nav-name").attr("href","#listNumber" + lists.id);
                $listsCardNav.find(".lists-nav-name").text("Список дел №" + (index + 1) + " - " + lists.name);
                if(index == 0) {
                    $listsCardNav.find(".lists-nav-name").addClass("active");
                    $listsCardNav.find(".lists-nav-name").attr("aria-selected","true");
                }
                else {
                    $listsCardNav.find(".lists-nav-name").attr("aria-selected","false");
                }

                $("#myTab").append($listsCardNav);
                $("#all_lists_tab-content").append($listsCardBody);
                $("#listPriority").append($('<option>', {
                    value: lists.id,
                    text: "Список дел №" + (index + 1) + " - " + lists.name
                }));

                if (json[index].items.length != 0) {
                    for (let items of json[index].items) {
                        if(items.isDone == true) {
                            $listItem = $listsItemDone.clone();
                        }
                        else {
                            $listItem = $listsItemCommon.clone();

                            $listItem.find(".check_btn")[0].addEventListener("click", function() {
                                sendRequest(checkItemUrl, "POST", {
                                    ownerId: lists.ownerId,
                                    id : items.id
                                })
                            });

                            $listItem.find(".edit_btn")[0].addEventListener("click", function() {
                                $("#editModal").on("show.bs.modal", function() {
                                    $("#editModal").find("#modalElHeader").val(items.name);
                                    $("#editModal").find("#modalElPriority").val(items.priority);
                                    $("#editModal").find("#modalElDescription").val(items.description);

                                    $("#save_changes_btn").click(function() {
                                        let name = $("#editModal").find("#modalElHeader")[0].value;
                                        let descr = $("#editModal").find("#modalElDescription")[0].value;
                                        let priority = parseInt($("#editModal").find("#modalElPriority")[0].value, 10);
                                        let listId = lists.id;
                                        let id = items.id;
                                        createOrUpdateNewItem(name, descr, priority, listId, id); 
                                    });
                                })
                            });

                            $listItem.find(".delete_btn")[0].addEventListener("click", function() {
                                sendRequest(deleteItemUrl, "DELETE", {
                                    ownerId: lists.ownerId,
                                    id : items.id
                                })
                            });
                        }
                        $listItem.removeClass("d-none");
                        $listItem.attr("id", "itemNumber" + items.id);
                        $listItem.find(".item-priority").addClass(priorities[items.priority]);
                        $listItem.find(".item-name").text(items.name);
                        $listItem.find(".item-data").text(getFormattedDate(items.createDateTime));
                        $listItem.find(".item-description").text(items.description);
                        $listsCardBody.find(".list-group").append($listItem);     
                    }
                }
                index++;
            } 
        }
    })
    .catch(error => console.error(error));
}

function createNewList(listName) {
    sendRequest(listCreationUrl, "POST", {
        id: null,
        name: listName
    })
}
function createOrUpdateNewItem(name, desc, prior, listid, id = null) {
    sendRequest(itemCreationUrl, "POST", {
        id: id,
        name: name,
        description: desc,
        priority: prior,
        listId: listid
    });
}

function sendRequest(url, method, body = null) {
    fetch (url, {
        credentials: "same-origin",
        method: method,
        body: JSON.stringify(body),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        loadLists();
    })
    .catch(error => console.error(error));
}

$(document).ready(function() {
    authorize();
    loadLists();

    $('#submit_list_btn').click(function(e) {
        if ($('#listName')[0].value != '') {
            e.preventDefault();
            createNewList($('#listName')[0].value);
        }
        else {
            $('#listName')[0].required = true;
        }
    });

    $('#submit_element_btn').click(function(e) {
        let name = $('#elementHeader')[0].value;
        let description = $('#elementDescription')[0].value;
        let priority =  parseInt($('#elementPriority')[0].value, 10);
        let listId = parseInt($('#listPriority')[0].value, 10);
        if (name != ''  && description != '') {
            e.preventDefault();
            createOrUpdateNewItem(name, description, priority, listId);
        }
        else {
            name.required = true;
            description.required = true;
        }
    });
})





















/* 
function createNewList(listName) {
    fetch (listCreationUrl, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({
            id: null,
            name: listName
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        listsCount++;
        loadLists();
    })
    .catch(error => console.error(error));
}

function deleteList(id) {
    fetch (deleteListUrl, {
        credentials: "same-origin",
        method: "DELETE",
        body: JSON.stringify({
            id: id
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        listsCount--;
        loadLists();
    })
    .catch(error => console.error(error));
}

function createNewItem(name, desc, prior, listid, id = null) {
    fetch (itemCreationUrl, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({
            id: id,
            name: name,
            description: desc,
            priority: prior,
            listId: listid
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        loadLists();
    })
    .catch(error => console.error(error));
}

function markItemAsChecked(ownerid, id) {
    fetch (checkItemUrl, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({
            ownerId: ownerid,
            id : id
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        loadLists();
    })
    .catch(error => console.error(error));
}

function deleteItem(ownerid, id) {
    fetch (deleteItemUrl, {
        credentials: "same-origin",
        method: "DELETE",
        body: JSON.stringify({
            ownerId: ownerid,
            id : id
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("SavedToken")
        }),      
    })
    .then(() => {
        loadLists();
    })
    .catch(error => console.error(error));
} 


*/