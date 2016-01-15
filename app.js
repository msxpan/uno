
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var users = {};//存储在线用户列表的对象
var roomInfo = {};

app.get('/', function (req, res) {
  if (req.cookies.user == null) {
    res.redirect('/signin');
  } else
   if(req.cookies.room == null){
    res.redirect('/hall');
  } else{
    res.sendfile('views/index.html');
  }
});
  
app.get('/signin', function (req, res) {
  res.sendfile('views/signin.html');
});

app.post('/signin', function (req, res) {
  if (users[req.body.name]) {
    //存在，则不允许登陆
    res.redirect('/signin');
  } else {
    //不存在，把用户名存入 cookie 并跳转到主页
    res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
    res.redirect('/hall');
  }
});


app.get('/hall', function (req, res) {
  res.sendfile('views/hall.html');
});

app.post('/hall', function (req, res) {
    res.cookie("room", req.body.room, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
});



var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.configure('development', function(){
    io.enable('browser client etag');
    io.set('log level', 1);
});


io.sockets.on('connection', function (socket) {

  //有人上线
  socket.on('online', function (data) {
    // 进入房间
    if (data.room) {

      // 将用户名加入房间名单中
      if (!roomInfo[data.room]) {
        roomInfo[data.room] = [];
      }
      // 不重复保存
      if (roomInfo[data.room].indexOf(data.user)<0) {
        roomInfo[data.room].push(data.user);
      };

      if (io.sockets.clients().length<4) {
        socket.join(data.room);
        console.log(roomInfo[data.room]);
      };
    };

    //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
    socket.name = data.user;
    //users 对象中不存在该用户名则插入该用户名
    if (!users[data.user]) {
      users[data.user] = data.user;
    }
    //向所有用户广播该用户上线信息
    // io.sockets.emit('online', {users: users, user: data.user});
    //向房间用户广播该用户进入房间信息
    io.sockets.to(data.room).emit('online', {users: users, user: data.user,usersInRoom:roomInfo[data.room]});

    //有人下线
    socket.on('disconnect', function() {
      //若 users 对象中保存了该用户名
      if (users[socket.name]) {
        //从 users 对象中删除该用户名
        delete users[socket.name];

        // 从房间中删除该用户名
        roomInfo[data.room].remove(data.user);

        //向其他所有用户广播该用户下线信息
        // socket.broadcast.emit('offline', {users: users, user: socket.name});
        //向房间用户广播该用户离开信息
        io.sockets.to(data.room).emit('offline', {users: users, user: socket.name,usersInRoom:roomInfo[data.room]});
      }
    });
  });

  //有人发话
  socket.on('say', function (data) {
    if (data.to == 'all') {
        //向其他所有用户广播该用户发话信息
        // socket.broadcast.emit('say', data);
        //向房间内所有用户广播该用户发话信息
        io.sockets.to(data.room).emit('say', data);
    } else {
      //向特定用户发送该用户发话信息
      //clients 为存储所有连接对象的数组
      var clients = io.sockets.clients();
      //遍历找到该用户
      clients.forEach(function (client) {
        if (client.name == data.to) {
          //触发该用户客户端的 say 事件
          client.emit('say', data);
        }
      });
    }
  });


});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
        return this;
    }else{
      return false;
    }
};