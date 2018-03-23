var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', function (req, res) {
    res.render("index")
})

http.listen(9999, () => console.log('Blink.io listening on port 9999!'));

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('message', function (msg) {
        console.log('message: ' + msg);
    });
});