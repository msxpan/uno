$(document).ready(function() {
  $(window).keydown(function (e) {
    if (e.keyCode == 116) {
      if (!confirm("刷新将会清除所有聊天记录，确定要刷新么？")) {
        e.preventDefault();
      }
    }
  });

  var socket = io.connect();

  // 房间

  //从 cookie 中读取用户名，存于变量 from
  var from = $.cookie('user');
  //设置默认接收对象为"所有人"
  var to = 'all';
  // 玩家手牌
  var playerHands;

  //发送用户进入房间提示
  var roomNum = $.cookie('room');
    socket.emit('online', {user: from,room:roomNum});

    // 如果房间已满 返回大厅
    socket.on('isFull',function(){
      window.location.href="hall"; 
    })

  // 用户上线
  socket.on('online', function (data) {
    //显示系统消息
    if (data.user != from) {
      var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 进入房间！</div>';
    } else {
      var sys = '<div style="color:#f00">系统(' + now() + '):你进入了房间'+roomNum+'！</div>';
    }
    $("#contents").append(sys + "<br/>");

    //刷新全部在线用户列表
    // flushUsers(data.users);
    
    //显示正在对谁说话
    showSayTo();
    //刷新当前房价用户在线列表
    flushUsersInRoom(data.usersInRoom)
  });

  // 开局
  socket.on('initCard',function(data){
    $("#contents").append('<div>给' + data.user + '发牌：'+data.playerHands+'</div><br/>');
    playerHands = data.playerHands;
    $('#play_content a').html('');

    // 显示开局牌组
    for (var i = 0; i < playerHands.length; i++) {
      if ($('#play_content a').length<7) {
        $('#play_content').append($('#play_content a').eq(0).clone(true));
      };

      $('#play_content a').eq(i).html(playerHands[i]);
    };
  })

  // 对话
  socket.on('say', function (data) {
    //房间内广播
    if (data.to == 'all') {
      $("#contents").append('<div>' + data.from + '(' + now() + ')对 所有人 说：<br/>' + data.msg + '</div><br />');
    }
    //私信
    if (data.to == from) {
      $("#contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')对 你 说：<br/>' + data.msg + '</div><br />');
    }
  });


  socket.on('playAHand', function (data) {
    //出牌
    if (data.to == 'all') {
      $("#contents").append('<div>' + data.from + '(' + now() + ')出牌：<br/>' + data.msg + '</div><br />');
    }
    
    // if (data.to == from) {
    //   $("#contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')对 你 说：<br/>' + data.msg + '</div><br />');
    // }
  });

  //用户下线
  socket.on('offline', function (data) {
    //显示系统消息
    var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 离开了房间！</div>';
    $("#contents").append(sys + "<br/>");

    //刷新全部在线用户列表
    // flushUsers(data.users);
    
    //刷新当前房价用户在线列表
    flushUsersInRoom(data.usersInRoom)

    //如果正对某人聊天，该人却下线了
    if (data.user == to) {
      to = "all";
    }

    //显示正在对谁说话
    showSayTo();
  });

  //服务器关闭
  socket.on('disconnect', function() {
    var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';
    $("#contents").append(sys + "<br/>");
    $("#list").empty();
  });

  //重新启动服务器
  socket.on('reconnect', function() {
    var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';
    $("#contents").append(sys + "<br/>");
    socket.emit('online', {user: from,room:roomNum});
  });

  //刷新全部在线用户列表
  // function flushUsers(users) {
  //   //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果
  //   $("#list").empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
  //   //遍历生成用户在线列表
  //   for (var i in users) {
  //     $("#list").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
  //   }
  //   //双击对某人聊天
  //   $("#list > li").dblclick(function() {
  //     //如果不是双击的自己的名字
  //     if ($(this).attr('alt') != from) {
  //       //设置被双击的用户为说话对象
  //       to = $(this).attr('alt');
  //       //清除之前的选中效果
  //       $("#list > li").removeClass('sayingto');
  //       //给被双击的用户添加选中效果
  //       $(this).addClass('sayingto');
  //       //刷新正在对谁说话
  //       showSayTo();
  //     }
  //   });
  // }

  //刷新当前房间用户在线列表
  function flushUsersInRoom(users) {
    //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果
    $("#listInRoom").empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">当前房间</li>');

    //遍历生成用户在线列表
    for (var i = 0; i < users.length; i++) {
      $("#listInRoom").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
    };

    //双击对某人聊天
    $("#listInRoom > li").dblclick(function() {
      //如果不是双击的自己的名字
      if ($(this).attr('alt') != from) {
        //设置被双击的用户为说话对象
        to = $(this).attr('alt');
        //清除之前的选中效果
        $("#listInRoom > li").removeClass('sayingto');
        //给被双击的用户添加选中效果
        $(this).addClass('sayingto');
        //刷新正在对谁说话
        showSayTo();
      }
    });
  }

  //显示正在对谁说话
  function showSayTo() {
    $("#from").html(from);
    $("#to").html(to == "all" ? "所有人" : to);
  }

  //获取当前时间
  function now() {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }

  // 出牌
  $("#play_content>a").click(function() {
    //获取要发送的信息
    var $msg = $(this).html();
    if ($msg == "") return;
    if (playerHands.indexOf($msg)<0) return;

    playerHands.remove($msg)
    
    //出牌
    socket.emit('playAHand', {from: from, to: to, msg: $msg,room:roomNum});

    // 将该牌从手牌移除
    $(this).remove();
  });


  // 摸牌
  $("#play").click(function() {
    //发送摸牌请求
    socket.emit('touchCard', {from: from, room:roomNum});
  });

  socket.on('dealCard', function(data){
      $('#play_content').append($('#play_content a').eq(0).clone(true));
      $('#play_content a:last-child').html(data);

      // 将摸牌添加进手牌
      playerHands.push(data);
  });

  //对话
  $("#say").click(function() {
    //获取要发送的信息
    var $msg = $("#input_content").html();
    if ($msg == "") return;
    //把发送的信息先添加到自己的浏览器 DOM 中
    if (to == "all") {
      $("#contents").append('<div>你(' + now() + ')对 所有人 说：<br/>' + $msg + '</div><br />');
    } else {
      $("#contents").append('<div style="color:#00f" >你(' + now() + ')对 ' + to + ' 说：<br/>' + $msg + '</div><br />');
    }
    //发送发话信息
    socket.emit('say', {from: from, to: to, msg: $msg,room:roomNum});
    //清空输入框并获得焦点
    $("#input_content").html("").focus();
  });
});

// 数组操作
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



