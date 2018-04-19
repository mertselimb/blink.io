var socket = io();
username = "";
listening = "All Chat";
users = new Array();
focus = true;

var sound = new Howl({
    src: ['definite.mp3']
});

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
    window.addEventListener('focus', function () {
        focus = true;
    });
    window.addEventListener('blur', function () {
        focus = false;
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
    if (data.from != listening || !focus) {
        ringNotification();
    }
    refreshMessages();
});

socket.on("messageAll", function (data) {
    if (!users["All Chat"]) {
        users["All Chat"] = [];
    }
    users["All Chat"].push(data);
    if (listening != listening || !focus) {
        ringNotification();
    }
    refreshMessages();
});

function endIntro() {
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
    var d = new Date();
    if (!message || !to) return false;
    if (to != "All Chat") {
        socket.emit('message', {
            message: message,
            to: to,
            from: username,
            time: d.getHours() + ":" + d.getMinutes()
        });
        if (!users[to]) {
            users[to] = [];
        }
        users[to].push({
            from: "you",
            message: message,
            time: d.getHours() + ":" + d.getMinutes()
        });
    } else {
        socket.emit('messageAll', {
            message: message,
            to: to,
            from: username,
            time: d.getHours() + ":" + d.getMinutes()
        });
    }
    if (to != "All Chat") {
        $(".messages").append(createMessageOut({
            message: message,
            time: d.getHours() + ":" + d.getMinutes()
        }));
    }
    $('.messages').scrollTop($('.messages')[0].scrollHeight);
    $(".messageInput").val("");
}

function initChangeContact(name) {
    $("#currentUserSign").text(name.substring(0, 2));
    $("#currentUserName").text(name);
    listening = name;
    refreshMessages();
}

function refreshMessages() {
    $(".messages").empty()
    if (!users[listening]) {
        users[listening] = [];
    }
    html = "";
    if (listening == "All Chat") {
        for (var i = 0; i < users[listening].length; i++) {
            if (users[listening][i].from == username) {
                html += createMessageOut({
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            } else {
                html += createMessageIn({
                    message: users[listening][i].from + " : " + users[listening][i].message,
                    time: users[listening][i].time
                });
            }
        }
    } else {
        for (var i = 0; i < users[listening].length; i++) {
            if (users[listening][i].from == "you") {
                html += createMessageOut({
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            } else {
                html += createMessageIn({
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            }
        }
    }
    $(".messages").html(html);
    $(function () {
        var wtf = $('.messages');
        var height = $('.messages')[0].scrollHeight;
        $('.messages').scrollTop($('.messages')[0].scrollHeight);
    });
}

function connect() {
    socket.emit('login', username);
}

function createUser(name) {
    return '<div class = "info"><span class = "userSign">' + name.substring(0, 2) + '</span> <span class = "userName" >' + name + '</span> </div>';
}

function createMessageIn(data) {
    return "<div class='message incoming'><p>" + data.message + "</p><span>" + data.time + "</span></div>"
}

function createMessageOut(data) {
    var d = new Date();
    return "<div class='message send'><p>" + data.message + "</p><span>" + data.time + "</span></div>"
}

function ringNotification() {
    sound.play();
}