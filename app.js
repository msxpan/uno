
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

//存储在线用户列表的对象
var users = {};
// 存储房间信息
var roomInfo = {};
// 存储房间卡牌信息
var roomUno = {};


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

// 登录
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

// 选择房间
app.get('/hall', function (req, res) {
  res.sendfile('views/hall.html');
});

app.post('/hall', function (req, res) {
    res.cookie("room", req.body.room, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
});


// uno原始卡牌
var unoOriginal=[
    'r0','r1','r2','r3','r4','r5','r6','r7','r8','r9','r1','r2','r3','r4','r5','r6','r7','r8','r9',
    'y0','y1','y2','y3','y4','y5','y6','y7','y8','y9','y1','y2','y3','y4','y5','y6','y7','y8','y9',
    'b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','b1','b2','b3','b4','b5','b6','b7','b8','b9',
    'g0','g1','g2','g3','g4','g5','g6','g7','g8','g9','g1','g2','g3','g4','g5','g6','g7','g8','g9',
];

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

      //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
      socket.name = data.user;
      //users 对象中不存在该用户名则插入该用户名
      if (!users[data.user]) {
        users[data.user] = data.user;
      }

      // 将用户名加入房间名单中
      if (!roomInfo[data.room]) {
        roomInfo[data.room] = [];
      }
      // 不重复保存
      if (roomInfo[data.room].indexOf(data.user)<0) {
        roomInfo[data.room].push(data.user);
      };

      // 总人数
      console.log('在线总人数：'+io.sockets.clients().length);
      console.log(data.user+' 进入房间：'+data.room+'房间总人数：'+roomInfo[data.room].length);

      if (roomInfo[data.room].length<=4) {
        socket.join(data.room);
      }else{
        socket.emit('isFull','房间已满')
      }

      if (!roomUno[data.room]) {
          roomUno[data.room]=[]
      };

      if (roomInfo[data.room].length==2) { 
          var unoRefresh=getArrayItems(unoOriginal,76);

          // roomUno[data.room].push(getArrayItems(unoOriginal,76));
          //查询房间内所有用户 给每个用户发初始牌          
          io.sockets.clients().forEach(function (client,i) {
            if (client.name == roomInfo[data.room][i]) {
              //给房间内用户发牌
              var userInitCard = unoRefresh.splice(0,7);
              client.emit('initCard', '给'+client.name+'发牌发牌：'+userInitCard);
              roomUno[data.room]=unoRefresh;
            }
          });

          console.log('房间：'+data.room+' 玩家数：'+roomInfo[data.room].length+' 初始发牌剩余卡牌：'+roomUno[data.room].length);
        }


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


// 洗牌
function getArrayItems(arr, num) {
    //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    //取出的数值项,保存在此数组
    var return_array = new Array();
    for (var i = 0; i<num; i++) {
        //判断如果数组还有可以取出的元素,以防下标越界
        if (temp_array.length>0) {
            //在数组中产生一个随机索引
            var arrIndex = Math.floor(Math.random()*temp_array.length);
            //将此随机索引的对应的数组元素值复制出来
            return_array[i] = temp_array[arrIndex];
            //然后删掉此索引的数组元素,这时候temp_array变为新的数组
            temp_array.splice(arrIndex, 1);
        } else {
            //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
            break;
        }
    }
    return return_array;
}
