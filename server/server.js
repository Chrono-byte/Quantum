const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const oneLine = require('common-tags').oneLine
let userCount = 0
const { exec } = require('child_process');
var request=require("request");

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
    });

var users=[];

io.on('connection', function(socket){
  socket.on('ready',function(){
    socket.emit('who are you');
  });
  socket.on('id',function(i){
    if(users[socket.id]){
      socket.emit("error message",{
        "message":"no, bad. You already told me your id"
      });
    } else {
      users[socket.id]=i;
      users[socket.id].id=socket.id;
      users[socket.id].tag=users[socket.id].username+"#"+(socket.id).substring(0,5);
      socket.emit('server message','<b>You are:</b> '+users[socket.id].username+"#"+users[socket.id].id);
      socket.emit('who am i',users[socket.id]);
    }
  });
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        userCount = userCount-1
        io.emit('userChange', `${userCount}`)
    });
    socket.on('chat message', function(msg){
      if(!users[socket.id]){
        socket.emit("error message",{
          "message":"Session expired, aka the server restarted and your session data was deleted. sorry 'bout that."
        });
        return;
      }
      msg.username=users[socket.id].username+"#"+users[socket.id].id.substring(0,5);
        if(msg.username === '') return socket.emit('error message', {
          "message":"You can't have a blank username!"
        });
        if(msg.msg === '') return socket.emit('error message', {
          "message":"You can't send a blank message!"
        });
        if(msg.msg.length > 500) return socket.emit("error message", {
          "message":"Message is too big (>500)"
        });
        if(msg.msg.match(/-([\S]*?)-/g)){
          msg.msg.match(/-([\S]*?)-/g).forEach(function(r){
            console.log("found: ",r);
            if(r){
              r=r.replace("-","").replace("-","");
              console.log("http://emoji.works/e/"+r);
              request("http://emoji.works/e/"+r,function(err,res,body){
                if(res&&res.statusCode!==404){
                  msg.msg=msg.msg.replace("-"+r+"-","<img src='http://emoji.works/e/"+r+"'></img>");
                }
              });
            }
          });
        }
        if(msg.msg === '/foo') {
            io.emit('chat message', `${msg.username}: I love foobar`)
        } else
        if(msg.msg === '/unflip') {
            io.emit('chat message', `${msg.username}: ┬─┬﻿ ノ( ゜-゜ノ)`)
        } else
        if(msg.msg === '/tableflip') {
            io.emit('chat message', `${msg.username}: (╯°□°）╯︵ ┻━┻`)
        } else
        if(msg.msg === '/shrug') {
            io.emit('chat message', `${msg.username}: ¯\\_(ツ)_/¯`)
        }   else {
            io.emit('chat message', `${msg.username}: ${msg.msg}`);
            console.log(`New Message: ${msg.username}: ${msg.msg}`)
        }
        if (msg.msg==="/update") {
          exec('git pull', (err, stdout, stderr) => {
            if (err) {
              socket.emit('server message','<b>Error while executing:</b><br><br><div class="panel">'+err+'</div>');
              return;
            }

            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            exec('node status.js update',function(){});
            socket.emit('server message','<b>Result:</b><br><br><div class="panel">'+stdout+'</div>');
          });
        }
        if(msg.msg==="/shutdown"){
          io.emit('server message','<b>Server is shutting down</b>');
          process.exit();
        }
    });
});

http.listen(8081, function(){
  console.log('listening on *:8081');
});
