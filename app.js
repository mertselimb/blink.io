//Classic setup
var express = require('express') //Router framework
var app = express(); //Router framework
var http = require('http').Server(app); //Server framework
var io = require('socket.io')(http, { //Socket connection framework
    wsEngine: 'ws' //A bug solver for socket io that slowed down app
});
connections = []; //Raw connection data
users = []; //Connection data with usernames
usernames = []; //Username data

app.set("view engine", "ejs"); //Pointing out we will be using ejs not html (for no good reason)
app.use(express.static("public")); //Public directory will be static

app.get('/', function (req, res) { //Express set up for root route
    res.render("index")
})
http.listen(process.env.PORT || 9999, () => console.log('Blink.io listening on port 9999!')); //Start express server
setInterval(updateUsers, 15000); //Update user data of clients for no good reason

io.on('connection', function (socket) { //When a client connects
    socket.on('disconnect', function () { //When a client disconnects
        if (!socket.username) return; //If user not signed in return so we will not get errors
        usernames[usernames.indexOf(socket.username + "[ONLINE]")] = usernames[usernames.indexOf(socket.username + "[ONLINE]")].replace("[ONLINE]", "[OFFLINE]"); //Get rid of user data
        users.splice(socket.username, 1); //Get rid of user data
        connections.splice(connections.indexOf(socket), 1); //Get rid of user data
        console.log(socket.ip + '  Disconnected:' + socket.username + ' >> ' + connections.length + " sockets connected."); //Write console the data
    });
    socket.on('login', function (data) { //When a client lo
        socket.username = data; //Retrieve socket username
        if (!socket.ip) { //If there is no ip (If user reconnects it will have ip)
            socket.ip = socket.request.connection.remoteAddress; //Get client ip
        }
        connections.push(socket); //Push raw data array
        users[socket.username] = socket; //Push data
        console.log(usernames[usernames.indexOf(socket.username + "[OFFLINE]")]);
        if (usernames[usernames.indexOf(socket.username + "[OFFLINE]")] != undefined) //If there are old data
            usernames.splice(usernames.indexOf(socket.username + "[OFFLINE]"), 1); //Get rid of old data
        usernames.push(data + "[ONLINE]"); //Push username as a dictionary (string indexed array)
        console.log(socket.ip + '  Connected:' + data + ' >> ' + connections.length + " sockets connected."); //Write console the data
    });
    socket.on('message', function (data) { //When a client sents message
        if (data.to != socket.username) //If client doens't send message to itself
            socket.broadcast.to(users[data.to.replace("[ONLINE]", "")].id).emit('message', data); //Send data retrieved to client
    });
    socket.on('messageAll', function (data) { //When a client sents message to all chat
        io.sockets.emit("messageAll", data); //Send data retrieved to all clients
    });
});

function updateUsers() { //Update every clients user data
    io.sockets.emit("updateUsers", usernames); //Send data to all clients
}