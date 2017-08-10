const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const oneLine = require('common-tags').oneLine
let userCount = 0

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/users/userconfig.json', function(req, res){
  res.sendFile(__dirname + '/users/userconfig.json');
});

io.on('connect', function(){
        console.log('a user connected');
        userCount = userCount+1
        io.emit('userChange', `${userCount}`)
})

io.on('disconnect', function(){
        console.log('a user connected');
        userCount = userCount+1
        io.emit('userChange', `${userCount}`)
    })

io.on('connection', function(socket){
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        userCount = userCount-1
        io.emit('userChange', `${userCount}`)
    });
    socket.on('chat message', function(msg){
        if(msg.username === '') return socket.emit('chat message', 'SERVER: NO BLANK USERNAMES');
        if(msg.msg === '') return socket.emit('chat message', 'SERVER: NO BLANK MESSAGES');
        if(msg.msg === '/foo') {
            io.emit('chat message', `${msg.username}: I love foobar`)
        }
        else {
            io.emit('chat message', `${msg.username}: ${msg.msg}`);
            console.log(`New Message: ${msg.username}: ${msg.msg}`)
        }
    });
});    

http.listen(80, function(){
  console.log('listening on *:80');
});