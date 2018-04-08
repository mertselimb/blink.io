var socket = io();
username = "";
listening = "All Chat";
users = new Array();

$(document).ready(function () {

    $(".btnSend").click(function () {
        sendMessage();
    });
    $(".messageInput").keypress(function (e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            sendMessage();
            return false;
        }
    });
    $(document).on('click', '#btnUsername', function () {
        if ($("#usernameInput").val()) {
            endIntro();
            connect();
        }
    });
    $(document).on('keypress', '#usernameInput', function (e) {
        if (e.which == 13) {
            if ($("#usernameInput").val()) {
                endIntro();
                connect();
                return false;
            }
            return false;
        }
    });
});

socket.on("updateUsers", function (data) {
    var html = "";
    for (var i = 0; i < data.length; i++) {
        if (data[i] != username)
            html += createUser(data[i]);
    }
    $(".users").html(html);
    $(".panel .info").click(function () {
        initChangeContact($(this).children('span.userName').text());
    });
});

socket.on("message", function (data) {
    if (!users[data.from]) {
        users[data.from] = [];
    }
    users[data.from].push(data);
    if (data.from == listening) {
        refreshMessages();
    }
});

socket.on("messageAll", function (data) {
    if (!users["All Chat"]) {
        users["All Chat"] = [];
    }
    users["All Chat"].push(data);
    if (listening == "All Chat") {
        refreshMessages();
    }
});

function endIntro(params) {
    username = $("#usernameInput").val();
    $(".intro").fadeOut(400, function () {
        $(".container").fadeIn(400, function () {
            $(".container").css("display", "flex");
        });
    });
}

function sendMessage() {
    to = $("#currentUserName").text();
    message = $(".messageInput").val();
    if (!message || !to) return false;
    if (to != "All Chat") {
        socket.emit('message', {
            message: message,
            to: to,
            from: username
        });
        if (!users[to]) {
            users[to] = [];
        }
        users[to].push({
            from: "you",
            message: message
        });
    } else {
        socket.emit('messageAll', {
            message: message,
            to: to,
            from: username
        });
    }
    if (to != "All Chat") {
        $(".messages").append(createMessageOut(message));
    }
    $(".messageInput").val("");
}

function initChangeContact(name) {
    $("#currentUserSign").text(name.substring(0, 2));
    $("#currentUserName").text(name);
    listening = name;
    $(".messages").empty()
    refreshMessages();
}

function refreshMessages() {
    if (!users[listening]) {
        users[listening] = [];
    }
    html = "";
    if (listening == "All Chat") {
        for (var i = 0; i < users[listening].length; i++) {
            if (users[listening][i].from == username) {
                html += createMessageOut(users[listening][i].message);
            } else {
                html += createMessageIn(users[listening][i].from + " : " + users[listening][i].message);
            }
        }
    } else {
        for (var i = 0; i < users[listening].length; i++) {
            if (users[listening][i].from == "you") {
                html += createMessageOut(users[listening][i].message);
            } else {
                html += createMessageIn(users[listening][i].message);
            }
        }
    }
    $(".messages").html(html);
}

function connect() {
    socket.emit('login', username);
}

function createUser(name) {
    return '<div class = "info"><span class = "userSign">' + name.substring(0, 2) + '</span> <span class = "userName" >' + name + '</span> </div>';
}

function createMessageIn(message) {
    var d = new Date();
    return "<div class='message incoming'><p>" + message + "</p><span>" + d.getHours() + ":" + d.getMinutes() + "</span></div>"
}

function createMessageOut(message) {
    var d = new Date();
    return "<div class='message send'><p>" + message + "</p><span>" + d.getHours() + ":" + d.getMinutes() + "</span></div>"
}