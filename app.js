var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    wsEngine: 'ws'
});
connections = [];
users = [];
usernames = [];

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', function (req, res) {
    res.render("index")
})
http.listen(process.env.PORT || 9999, () => console.log('Blink.io listening on port 9999!'));
setInterval(updateUsers, 15000);

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        if (!socket.username) return;
        usernames.splice(usernames.indexOf(socket.username), 1);
        users.splice(socket.username, 1);
        connections.splice(connections.indexOf(socket), 1);
        console.log(socket.ip + '  Disconnected:' + socket.username + ' >> ' + connections.length + " sockets connected.");
    });
    socket.on('login', function (data) {
        socket.username = data;
        socket.ip = socket.conn.transport.socket._socket.remoteAddress;
        connections.push(socket);
        users[socket.username] = socket;
        usernames.push(data);
        console.log(socket.ip + '  Connected:' + data + ' >> ' + connections.length + " sockets connected.");
    });
    socket.on('message', function (data) {
        if (data.to != socket.username)
            socket.broadcast.to(users[data.to].id).emit('message', data);
    });
    socket.on('messageAll', function (data) {
        io.sockets.emit("messageAll", data);
    });
});

function updateUsers() {
    io.sockets.emit("updateUsers", usernames);
}