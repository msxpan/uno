$(document).ready(function() {
  $(window).keydown(function (e) {
    if (e.keyCode == 116) {
      if (!confirm("刷新将会清除所有聊天记录，确定要刷新么？")) {
        e.preventDefault();
      }
    }
  });

  var socket = io.connect();

  var colorArray = {r:'#d82520', y:'#fff300', b:'#0391dd', g:'#00923d'};
  var numArray = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9','+2','+4');
  var sence = document.getElementById("sence");
  var ctx = sence.getContext("2d");
  
  var cardArray = [];

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

    for (i = 0 ; i < 7; ++i ) {
      // 生成卡片
      var card = {}
      card.color = colorArray[playerHands[i].slice(0,1)];
      card.num = numArray[playerHands[i].slice(1)];
      card.x = 110 + 90 * i;
      card.y = 460;
      card.width = 150;
      card.height = 230;

      cardArray.push(card);
    }

    for (i = 0 ; i < 7; ++i ) {
      var card = cardArray[i];
      cardMake(ctx, card.x, card.y, card.color , card.num);  // 横坐标，纵坐标，颜色，数字 
    }



    // 显示开局牌组
    for (var i = 0; i < playerHands.length; i++) {
      if ($('#play_content a').length<7) {
        $('#play_content').append($('#play_content a').eq(0).clone(true));
      };

      $('#play_content a').eq(i).html(playerHands[i]);
    };
  })



  var XX, YY;

  sence.addEventListener('touchstart', function(event) {
    ctx.clearRect(0, 0, 150, 230);
  })

  sence.addEventListener('touchmove', function(event) {
    if(event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        for (i = cardArray.length-1; i >= 0; --i) {
            var card = cardArray[i];                                
            if (hitTest(touch.pageX, touch.pageY, card)) {
                ctx.clearRect(0, 0, 1000, 750);
                reDrawCard(i);
                break;
            }
        }
        XX = touch.pageX;
        YY = touch.pageY;
    }
  })

  sence.addEventListener("touchend", function(event) {
    for (i = cardArray.length-1; i >= 0; --i) {
        var card = cardArray[i];  
        console.log('end'+XX+' '+YY)
        console.log('end'+card.x+' '+card.x+card.width+' '+card.y+' '+card.y+card.height)

        if (hitTest(XX, YY, card)) {
            console.log(cardArray[i].num)
            ctx.clearRect(0, 0, 1000, 750);            
            showAHand(i);
            break;
        }
    }
  }, false);

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
      // $("#contents").append('<div>你(' + now() + ')对 所有人 说：<br/>' + $msg + '</div><br />');
    } else {
      $("#contents").append('<div style="color:#00f" >你(' + now() + ')对 ' + to + ' 说：<br/>' + $msg + '</div><br />');
    }
    //发送发话信息
    socket.emit('say', {from: from, to: to, msg: $msg,room:roomNum});
    //清空输入框并获得焦点
    $("#input_content").html("").focus();
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

function cornerRectPath(ctx, x, y, width, height, corner) {
    ctx.beginPath();
    ctx.moveTo(x + corner, y);
    ctx.arcTo(x + width, y, x + width, y + corner, corner);
    ctx.arcTo(x + width, y + height, x + width - corner, y + height, corner);
    ctx.arcTo(x, y + height, x, y + height - corner, corner);
    ctx.arcTo(x, y, x + corner, y, corner);
  }

function ellipsePath(ctx, centerX, centerY, width, height) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - height/2); // A1

    ctx.bezierCurveTo(
      centerX + width/2, centerY - height/2, // C1
      centerX + width/2, centerY + height/2, // C2
      centerX, centerY + height/2); // A2

    ctx.bezierCurveTo(
      centerX - width/2, centerY + height/2, // C3
      centerX - width/2, centerY - height/2, // C4
      centerX, centerY - height/2); // A1
  }



function cardMake(ctx, x, y, color, num) {
    var width = 150
    var height = width / 15 * 23
    var corner = width / 15
    var inner = corner
    var innerWidth = width - inner * 2;
    var innerHeight = height - inner * 2;

    var wideInnerWidth=width/3;
    var wideInnerHeight=wideInnerWidth/15*23;
  
    // 画外框
    cornerRectPath(ctx, x, y, width, height, corner)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.fill();

    // 填充内框
    cornerRectPath(ctx, x + inner, y + inner, innerWidth, innerHeight, corner / 2)
    if (num=='+4'||num=='wild') {
      ctx.fillStyle = '#000';
    }else{
      ctx.fillStyle = color;
    }
    ctx.fill();

    // 椭圆
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(Math.PI / 6)
    ellipsePath(ctx, 0, 0, innerWidth * 1.2, innerHeight)
    ctx.fillStyle = 'white';
    ctx.fill();
    // ctx.restore()

    if (num=='+4') {

      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 1;

      cornerRectPath(ctx,0, -wideInnerHeight/2, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = '#00923D';
      ctx.fill();

      cornerRectPath(ctx,-wideInnerWidth/3,-wideInnerHeight/8, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = '#FFF300';
      ctx.fill();

      cornerRectPath(ctx,-wideInnerWidth/3*2, -wideInnerHeight/8*7, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = '#0391DD';
      ctx.fill();

      cornerRectPath(ctx,-wideInnerWidth, -wideInnerHeight/2, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = '#D82520';
      ctx.fill();

      ctx.restore()

    }else if (num=='+2') {

      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 1;

      cornerRectPath(ctx,-wideInnerWidth/3, -wideInnerHeight/8*6, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = color;
      ctx.fill();

      cornerRectPath(ctx,-wideInnerWidth/3*2, -wideInnerHeight/8*2, wideInnerWidth, wideInnerHeight, corner / 2)
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore()
    }else{

      ctx.restore()

      // 中间文字
      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.font = 'italic 70px impact';        // 字体
      ctx.textAlign = 'center';       // 水平居中
      ctx.textBaseline = 'middle';    // 垂直居中
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 1;
      ctx.fillStyle = color;
      ctx.fillText(num, -10, -5);
      ctx.restore()

    }


    // 两边文字
    ctx.save();
    ctx.translate(x + inner + 10, y + inner + 10);
    ctx.font = 'italic 20px impact';        // 字体
    ctx.textAlign = 'center';       // 水平居中
    ctx.textBaseline = 'middle';    // 垂直居中
    ctx.fillStyle = 'white';
    ctx.fillText(num, -3, 2);
    ctx.restore()

    ctx.save();
    ctx.translate(x + width - inner - 10, y + height - inner - 10);
    ctx.rotate(Math.PI)
    ctx.font = 'italic 20px impact';        // 字体
    ctx.textAlign = 'center';       // 水平居中
    ctx.textBaseline = 'middle';    // 垂直居中
    ctx.fillStyle = 'white';
    ctx.fillText(num, -3, 2);
    ctx.restore()
  }


  // 测试是否点中卡片          
  function hitTest(x, y, card) {
      if (card.x < x && x < card.x + card.width && card.y < y && y < card.y + card.height) {
          return true;
      }
      return false;                          
  }

  
  // 重绘卡片
  function reDrawCard(index) {
    for (i = 0 ; i < cardArray.length; ++i) {
      var card = cardArray[i];
      baseY = card.y;
      if (i == index) {
        baseY -= 30;
      }
      cardArray[i].x = 110 + 90 * i;

      cardMake(ctx, 110 + 90 * i, baseY, card.color , card.num);  // 横坐标，纵坐标，颜色，数字 
    }     
  }   

  // 出牌
  function showAHand(index) {
    for (i = 0 ; i < cardArray.length; ++i) {
      var card = cardArray[i];
      baseX = card.x;
      baseY = card.y;
      if (i == index) {
        baseX = 0;
        baseY = 0;
      }

      if (i>index) {
        baseX = 110 + 90 * i - 90;
      };

      cardMake(ctx, baseX, baseY, card.color , card.num);  // 横坐标，纵坐标，颜色，数字 
    }     
      cardArray.remove(cardArray[index])
  } 

  
});



