var socket = io();
username = "";
users = new Array(100);

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
    $(".panel .info").click(function () {
        sender = $(this).children('span.userName').text();
        $("#currentUserSign").text(sender.substring(0, 2));
        $("#currentUserName").text(sender);
    });
});

socket.on("updateUsers", function (data) {
    var html = "";
    for (var i = 0; i < data.length; i++) {
        html += createUser(data[i]);
    }
    $(".users").html(html);
    $(".panel .info").click(function () {
        sender = $(this).children('span.userName').text();
        $("#currentUserSign").text(sender.substring(0, 2));
        $("#currentUserName").text(sender);
    });
});

socket.on("message", function (data) {
    console.log(data);
});

socket.on("messageAll", function (data) {
    console.log(data);
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
        console.log(users);
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

function connect() {
    socket.emit('login', username);
}

function createUser(username) {
    return '<div class = "info"><span class = "userSign">' + username.substring(0, 2) + '</span> <span class = "userName" >' + username + '</span> </div>';
}

function createMessageIn(message) {
    var d = new Date();
    return "<div class='message incoming'><p>" + message + "</p><span>" + d.getHours() + ":" + d.getMinutes() + "</span></div>"
}

function createMessageOut(message) {
    var d = new Date();
    return "<div class='message send'><p>" + message + "</p><span>" + d.getHours() + ":" + d.getMinutes() + "</span></div>"
}