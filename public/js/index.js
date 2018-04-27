socket = io(); //Inir socket io
username = ""; //Clients username
listening = "All Chat"; //Holds data of the open chat
serverUsers = new Array(); //Users at the server
users = new Array(); //All users that have been contacted
isSeen = new Array(); //The array holds data that shows if the messages have been seen
focus = true; //Is the user look at the page at the moment
sound = new Howl({ //Init message sound
    src: ['definite.mp3']
});
disconnected = false; //Is client disconnected

$(document).ready(function () { //Functions that called after pageload
    $(".btnSend").click(function () { //Inits user click at click
        sendMessage(); //Sends the message 
    });
    $(".messageInput").keypress(function (e) { //Inits user click at enter button
        var key = e.which; //Get data from html event
        if (key == 13) // the enter key code
        {
            sendMessage(); //Sends the message
            return false;
        }
    });
    $(document).on('click', '#btnUsername', function () { //Set username and start the chat after connecting with click
        if ($("#usernameInput").val()) { //Read user input
            endIntro(); //End intro screen
            connect(); //Login to database
        }
    });
    $(document).on('keypress', '#usernameInput', function (e) { //Set username and start the chat after connecting with enter 
        if (e.which == 13) {
            if ($("#usernameInput").val()) { //Read user input
                endIntro(); //End intro screen
                connect(); //Login to database
                return false;
            }
            return false;
        }
    });
    window.addEventListener('focus', function () { //Init event listener that listens for users focus on the tab
        focus = true;
    });
    window.addEventListener('blur', function () { //Init event listener that listens for users focus on the tab
        focus = false;
    });
});

socket.on("updateUsers", function (data) { //Gets server updateUsers request(updates online users)
    var html = "";
    serverUsers = data; //Get servers users and load to local data
    for (var i = 0; i < data.length; i++) {
        if (data[i] != username) //If the user isn't you create a user template
            html += createUser(data[i]); //Add to html variable
    }
    $(".users").html(html); //Edit divs html
    $(".panel .info").click(function () { //Add click function to user divs
        initChangeContact($(this).children('span.userName').text()); //Change the focused chat window
    });
    isSeenRefresher(); //Refresh user divs seen status
});

socket.on("message", function (data) { //Gets server message request(reterieves private message)
    if (!users[data.from]) { //Is first message?
        $("#senderUsernameModal").text(data.from); //Fill the modal window span with username of whom the message is from
        users[data.from] = []; //Create blank array node so we won't get null error
    }
    isSeen[data.from] = false; //Message isn't seen yet
    users[data.from].push(data); //Push message to local array
    if (data.from != listening || !focus) { //If when the message came user isn't focusing the tab or not looking at the senders message window
        ringNotification(); //Ring notification sound
    }
    refreshMessages(); //Refresh all messages at the message window
    isSeenRefresher(); //Refresh user divs seen status
});

socket.on("messageAll", function (data) { //Gets server messageAll request(retrieves message for all chat)
    if (!users["All Chat"]) { //Is first message?
        users["All Chat"] = []; //Create blank array node so we won't get null error
    }
    users["All Chat"].push(data); //Push message to local array
    if (listening != listening || !focus) { //If when the message came user isn't focusing the tab or not looking at the senders message window
        ringNotification(); //Ring notification sound
    }
    refreshMessages(); //Refresh all messages at the message window
    isSeenRefresher(); //Refresh user divs seen status
});


function endIntro() { //Ends intro
    username = $("#usernameInput").val(); //Retrieves username from input
    $(".intro").fadeOut(400, function () { //Fade out intro screen 
        $(".container").fadeIn(400, function () { //Fade in chat screen after intro screen
            $(".container").css("display", "flex"); //Change display from hidden to flex
        });
    });
}

function sendMessage() { //What happens when clicked send or enter
    to = $("#currentUserName").text(); //Who is owner of the window we are looking at
    message = $(".messageInput").val(); //What is the message we will send
    var d = new Date(); //What is the time
    if (!message || !to) return false; //Is message or username null or empty
    if (to != "All Chat") { //If private
        socket.emit('message', { //Emit data to server contains JSON
            message: message,
            to: to,
            from: username,
            time: d.getHours() + ":" + d.getMinutes()
        });
        if (!users[to]) { //Is first message?
            users[to] = []; //Create blank array node so we won't get null error
        }
        users[to].push({ //Save data to local Array so we can use it after a change of chat window
            from: "you",
            message: message,
            time: d.getHours() + ":" + d.getMinutes()
        });
    } else { //If message is to all chat
        socket.emit('messageAll', { //Emit data to server contains JSON
            message: message,
            to: to,
            from: username,
            time: d.getHours() + ":" + d.getMinutes()
        });
    }
    if (to != "All Chat") { //If this is a private message create a message beforehand so we will not waste servers time to send the data back to us
        $(".messages").append(createMessageOut({ //Emit data to server contains JSON
            message: message,
            time: d.getHours() + ":" + d.getMinutes()
        }));
    }
    $('.messages').scrollTop($('.messages')[0].scrollHeight); //Go to bottom after sending
    $(".messageInput").val(""); //Clear message input
}

function initChangeContact(name) { //Change message window
    if (!isSeen[name]) { //Create blank array node so we won't get null error
        isSeen[name] = []; //Create blank array node so we won't get null error
    }
    isSeen[name] = true; //Message has been seen
    $("." + name).css("color", "white"); //Change usernames color
    $("#currentUserSign").text(name.substring(0, 2)); //Change user sign text
    $("#currentUserName").text(name); //Change user name 
    listening = name; //Change local variable for whose window is this
    refreshMessages(); //Get messages from local array
}

function isSeenRefresher() { //Refresh all user colors so we can see whose
    for (var i = 0; i < serverUsers.length; i++) { //Look at the array we retrieved from server
        if (isSeen[serverUsers[i]] == false && listening != serverUsers[i]) { //If messages are not seen and we are not looking at the window 
            $("." + serverUsers[i]).css("color", "rgb(97, 42, 119)"); //Change user color to purple
        }
        if (listening == serverUsers[i]) {
            isSeen[serverUsers[i]] = true;
        }
    }
}

function refreshMessages() { //Get all focused persons messages from local array
    $(".messages").empty() //Empty divs html so we won't get error
    if (!users[listening]) { //Is first message?
        users[listening] = []; //Create blank array node so we won't get null error
    }
    html = "";
    if (listening == "All Chat") { //If we are looking at all Chat window
        for (var i = 0; i < users[listening].length; i++) { //Retrieve all window owners messages
            if (users[listening][i].from == username) {
                html += createMessageOut({ //Create a template for messages we send
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            } else {
                html += createMessageIn({ //Create a template for messages we recieve
                    message: users[listening][i].from + " : " + users[listening][i].message,
                    time: users[listening][i].time
                });
            }
        }
    } else { //If we are looking at a private window
        for (var i = 0; i < users[listening].length; i++) { //Retrieve all window owners messages
            if (users[listening][i].from == "you") {
                html += createMessageOut({ //Create a template for messages we send
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            } else {
                html += createMessageIn({ //Create a template for messages we recieve
                    message: users[listening][i].message,
                    time: users[listening][i].time
                });
            }
        }
    }
    $(".messages").html(html); //Change divs html to new one
    $('.messages').scrollTop($('.messages')[0].scrollHeight); //Go to bottom of the div
}

function connect() { //Login to server with username. NOT connecting to server
    socket.emit('login', username); //Call servers login function
}

function createUser(name) { //Create user template
    return '<div class = "info"><span class = "userSign ' + name + ' ">' + name.substring(0, 2) + '</span> <span class = "userName ' + name + ' " >' + name + '</span> </div>';
}

function createMessageIn(data) { //Create recieved message template
    return "<div class='message incoming'><p>" + data.message + "</p><span>" + data.time + "</span></div>"
}

function createMessageOut(data) { //Create send message template
    var d = new Date();
    return "<div class='message send'><p>" + data.message + "</p><span>" + data.time + "</span></div>"
}

function ringNotification() { //Ring notification sound
    sound.play();
}