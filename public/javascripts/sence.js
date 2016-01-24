$(document).ready(function() {
    // 绘制圆角距形路径
    function cornerRectPath(ctx, frame, corner) {
	ctx.beginPath();
	ctx.moveTo(frame.x + corner, frame.y);
	ctx.arcTo(frame.x + frame.width, frame.y, frame.x + frame.width, frame.y + corner, corner);
	ctx.arcTo(frame.x + frame.width, frame.y + frame.height, frame.x + frame.width - corner, frame.y + frame.height, corner);
	ctx.arcTo(frame.x, frame.y + frame.height, frame.x, frame.y + frame.height - corner, corner);
	ctx.arcTo(frame.x, frame.y, frame.x + corner, frame.y, corner);
    }

    
    // 绘制椭圆路径
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

    // 绘卡
    function drawCard(ctx, card) {
	var cardframe = jQuery.extend(card.frame);
	var colorMap = {r:'#d82520', y:'#fff300', b:'#0391dd', g:'#00923d', w: 'black'};
	var corner = 10;

	// 解卡，卡的颜色，卡的数字
	var color = colorMap[card.name.slice(0, 1)];
	var type = card.name.slice(1);

	// 如果卡片处于选中状态，弹起40px
	if (card.selected) {
	    cardframe.y -= 40;
	}
	
	// 画外框
	cornerRectPath(ctx, cardframe, corner);
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.stroke();
	
	ctx.fillStyle = 'white';
	ctx.fill();

	// 画内框
	var inner = 5;
	var frame = {};
	frame.x = cardframe.x + inner;
	frame.y = cardframe.y + inner;
	frame.width = cardframe.width - inner * 2;
	frame.height = cardframe.height - inner * 2;
	cornerRectPath(ctx, frame, corner * 0.8);

	ctx.fillStyle = color;
	ctx.fill();
	
	// 椭圆
	ctx.save();
	ctx.translate(cardframe.x + cardframe.width / 2, cardframe.y + cardframe.height / 2);
	ctx.rotate(Math.PI / 6)
	ellipsePath(ctx, 0, 0, frame.width * 1.1, frame.height)
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.restore();

	// 两边文字
	ctx.save();
	ctx.translate(cardframe.x + inner + 10, cardframe.y + inner + 10);
	ctx.font = 'italic 18px impact';        // 字体
	ctx.textAlign = 'center';       // 水平居中
	ctx.textBaseline = 'middle';    // 垂直居中
	ctx.fillStyle = 'white';
	ctx.fillText(type, -2, 2);
	ctx.restore()
	
	ctx.save();
	ctx.translate(cardframe.x + cardframe.width - inner - 10, cardframe.y + cardframe.height - inner - 10);
	ctx.rotate(Math.PI)
	ctx.font = 'italic 18px impact';        // 字体
	ctx.textAlign = 'center';       // 水平居中
	ctx.textBaseline = 'middle';    // 垂直居中
	ctx.fillStyle = 'white';
	ctx.fillText(type, -2, 2);
	ctx.restore()

	var wideInnerWidth = cardframe.width / 3;
	var wideInnerHeight = wideInnerWidth / 2 * 3;

	// 中间文字
	if (type == '+2') {
	    // +2
	    ctx.save();
	    ctx.translate(cardframe.x + cardframe.width / 2, cardframe.y + cardframe.height / 2);
	    ctx.rotate(Math.PI / 6)

	    ctx.shadowColor = 'black';
	    ctx.shadowOffsetX = 3;
	    ctx.shadowOffsetY = 3;
	    ctx.shadowBlur = 1;
	    
	    cornerRectPath(ctx, {x : -wideInnerWidth/3, y : -wideInnerHeight / 8 * 6, width : wideInnerWidth, height : wideInnerHeight}, corner / 2);
	    ctx.fillStyle = color;
	    ctx.fill();
	    
	    cornerRectPath(ctx, {x : -wideInnerWidth / 3 * 2, y : -wideInnerHeight / 8 * 2, width : wideInnerWidth, height : wideInnerHeight}, corner / 2);
	    ctx.fillStyle = color;
	    ctx.fill();
	    ctx.restore();
	} else if (type == '+4'){
	    // +4
	    ctx.save();
	    ctx.translate(cardframe.x + cardframe.width / 2, cardframe.y + cardframe.height / 2);
	    ctx.rotate(Math.PI / 6)
	    
	    ctx.shadowColor = 'black';
	    ctx.shadowOffsetX = 3;
	    ctx.shadowOffsetY = 3;
	    ctx.shadowBlur = 1;
	    
	    cornerRectPath(ctx, {x : -2, y : -wideInnerHeight/2, width : wideInnerWidth, height : wideInnerHeight}, corner / 2)
	    ctx.fillStyle = colorMap.g;
	    ctx.fill();
	    
	    cornerRectPath(ctx, {x : -wideInnerWidth/3, y : -wideInnerHeight/8, width : wideInnerWidth, height : wideInnerHeight}, corner / 2)
	    ctx.fillStyle = colorMap.y;
	    ctx.fill();

	    cornerRectPath(ctx, {x : -wideInnerWidth/3*2, y : -wideInnerHeight/8*7, width : wideInnerWidth, height : wideInnerHeight}, corner / 2)
	    ctx.fillStyle = colorMap.b;
	    ctx.fill();
	    
	    cornerRectPath(ctx, {x : -wideInnerWidth, y : -wideInnerHeight/2, width : wideInnerWidth, height : wideInnerHeight}, corner / 2)
	    ctx.fillStyle = colorMap.r;
	    ctx.fill();

	    ctx.restore()

	} else {
	    // 0 - 9
	    ctx.save();
	    ctx.translate(cardframe.x + cardframe.width / 2, cardframe.y + cardframe.height / 2);
	    ctx.font = 'italic 60px impact';        // 字体
	    ctx.textAlign = 'center';       // 水平居中
	    ctx.textBaseline = 'middle';    // 垂直居中
	    ctx.shadowColor = 'black';
	    ctx.shadowOffsetX = 3;
	    ctx.shadowOffsetY = 3;
	    ctx.shadowBlur = 1;
	    ctx.fillStyle = color;
	    ctx.fillText(type, -7, -2);
	    ctx.restore()
	}
    }


    // 创建卡片card对象
    function createCard(ctx, name) {
	var card = {};
	card.name = name;
	card.selected = false;     // 选中标识，选中的牌上移40px，在牌的reDraw函数中处理
	card.context = ctx;

	

	// 是否点击此卡
	card.hitTest = function(point) {     
	    if (this.frame.x < point.x && point.x < this.frame.x + this.frame.width && this.frame.y < point.y && point.y < this.frame.y + this.frame.height) {
		return true;
	    }
	    return false;
	}

	// 重绘卡片
	card.reDraw = function() {
	    drawCard(this.context, this);
	}

	return card;
    }


    // 创建卡组cardGroup对象
    function createCardGroup(ctx, size) {
	var cardGroup = {};

	// 绘图上下文
	cardGroup.context = ctx;
	
	// CardGroup 定界
	var frame = {};
	frame.width = 700;
	frame.height = 240;	
	frame.x = (size.width - frame.width) / 2;
	frame.y = size.height - frame.height;
	
	cardGroup.frame = frame;

	// CardGroup 卡组
	cardGroup.cards = [];

	// 摸一张牌
	cardGroup.appendCard = function(name) {
	    var card = createCard(ctx, name);
	    
	    var frame = {};

	    frame.width = 100;
	    frame.height = 150;

	    if (this.cards.length == 0) {
		// 初始位置
		frame.x = 10;
		frame.y = 40;
	    } else {
		// 以卡组中最后一张的位置为基准，进行相对调整
		var lastCard = this.cards[this.cards.length - 1];
		
		if (lastCard.frame.x + 60 + lastCard.frame.width > this.frame.width) {
		    // 超过右边界，拆行并回到左边界
		    frame.x = 10;
		    frame.y = lastCard.frame.y + 60;
		} else {
		    // 未超右边界，直接放在卡组后面
		    frame.x = lastCard.frame.x + 60;
		    frame.y = lastCard.frame.y;
		}
	    }
	    
	    // 卡片加入位置属性
	    card.frame = frame;

	    // 加入卡组Array
	    this.cards.push(card);
	}

	// CardGroup 重绘
	cardGroup.reDraw = function() {
	    // 清除cardGroup的绘制区
	    this.context.clearRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
	    
	    // CardGroup的区域线，辅助用，最后删掉
	    this.context.beginPath();
	    this.context.moveTo(this.frame.x, this.frame.y + this.frame.height);
	    this.context.lineTo(this.frame.x, this.frame.y);
	    this.context.lineTo(this.frame.x + this.frame.width, this.frame.y);
	    this.context.lineTo(this.frame.x + this.frame.width, this.frame.y + this.frame.height);
	    this.context.lineWidth = 1;
	    this.context.strokeStyle = 'black';
	    this.context.stroke();

	    // 卡组重绘
	    this.context.save();
	    this.context.translate(this.frame.x, this.frame.y);       // 坐标系转换到CardGroup区
	    
	    for (i = 0; i < this.cards.length; ++i) {       // 调用每张Card的重绘
		this.cards[i].reDraw(this.context);
	    }

	    this.context.restore();
	}

	// 点击检测
	cardGroup.hitTest = function (point) {
	    if (this.frame.x < point.x && point.x < this.frame.x + this.frame.width && this.frame.y < point.y && point.y < this.frame.y + this.frame.height) {
		return true;
	    }
	    return false;						     
	}

	// 收到点击事件
	cardGroup.touchdown = function (point) {
	    if (this.hitTest(point)) {
		// 清理卡组的选中事件，所有牌落回基线
		for (i = 0; i < this.cards.length; ++i) {
		    var card = this.cards[i];
		    card.selected = false;
		}

		// 根据卡组中每张牌的坐标，判断哪张卡版被选中
		for (i = this.cards.length - 1; i >= 0; --i) {
		    var card = this.cards[i];
		    var cardPoint = {};

		    // 将全局坐标切换到cardGroup坐标，用作卡组判断
		    cardPoint.x = point.x - this.frame.x;
		    cardPoint.y = point.y - this.frame.y;

		    if (card.hitTest(cardPoint)) { // 调用每张card的hitTest
			card.selected = true;  // 点中的卡设为selected
			break;
		    }
		}
	    }
	}

	// 抬手
	cardGroup.touchup = function (callback) {
	    // TODO 出牌
	    for (i = 0; i < this.cards.length; ++i) {
		var card = this.cards[i];
		if (card.selected) {
		    for (j = this.cards.length - 1; j > i; --j) {
			var preCard = this.cards[j - 1];
			var curCard = this.cards[j];

			curCard.frame = preCard.frame;
		    }
		    this.cards.splice(i, 1);
		    callback(card);
		    break;
		}
	    }
	}

	
	
	return cardGroup;
    }

    // 创建出牌堆
    function createCardStack(ctx, size) {
	var cardStack = {};

	var frame = {};

	frame.width = 660;
	frame.height = 160;
	frame.x = (size.width - frame.width) / 2;
	frame.y = 160;

	cardStack.frame = frame;
	cardStack.context = ctx;
	cardStack.cards = [];
	cardStack.scale = 0.6;

	// CardStack 接收到一张牌
	cardStack.appendCard = function(card) {
	    // 设置投射系数
	    card.selected = false;
	    
	    var randomWidth = this.frame.width / this.scale - card.frame.width;
	    var randomHeight = this.frame.height / this.scale - card.frame.height;

	    var frame = jQuery.extend(card.frame);
	    frame.x = Math.floor(Math.random() * randomWidth);
	    frame.y = Math.floor(Math.random() * randomHeight);

	    card.frame = frame;

	    // 重绘
	    this.context.save();
	    this.context.translate(this.frame.x, this.frame.y);
	    this.context.scale(this.scale, this.scale);
	    card.reDraw();

	    this.context.restore();	    
	}
	
	// CardStack 重绘
	cardStack.reDraw = function() {
	    // 清除cardStack的绘制区
	    this.context.clearRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
	    
	    // CardStack的区域线，辅助用，最后删掉
	    this.context.beginPath();
	    this.context.moveTo(this.frame.x, this.frame.y + this.frame.height);
	    this.context.lineTo(this.frame.x, this.frame.y);
	    this.context.lineTo(this.frame.x + this.frame.width, this.frame.y);
	    this.context.lineTo(this.frame.x + this.frame.width, this.frame.y + this.frame.height);
	    this.context.lineTo(this.frame.x, this.frame.y + this.frame.height);
	    this.context.lineWidth = 1;
	    this.context.strokeStyle = 'black';
	    this.context.stroke();

	    // 卡组重绘
	    // this.context.save();
	    // this.context.translate(this.frame.x, this.frame.y);       // 坐标系转换到CardGroup区
	    
	    // for (i = 0; i < cardArray.length; ++i) {       // 调用每张Card的重绘
	    // 	cardArray[i].reDraw(this.context);
	    // }

	    // this.context.restore();
	}

	return cardStack;
    }

    // 创建场景
    function createSence(ctx, size) {
	var sence = {};
	
	// 原始场景尺寸
	sence.originalSize = {width : 1024, height : 576};

	// 真实投影场景尺寸
	sence.size = size;

	// 绘图上下文
	sence.context = ctx;
	

	// 全局坐标系变换，从原始场景向真实场景投射，变换后所有场景尺寸变为以1024*576为基准
	ctx.scale(size.width/sence.originalSize.width, size.height/sence.originalSize.height);

	// 创建用户CardGroup
	sence.cardGroup = createCardGroup(sence.context, sence.originalSize);

	// 创建出牌堆
	sence.cardStack = createCardStack(sence.context, sence.originalSize);
	
	// 重绘
	sence.reDraw = function() {
	    sence.cardGroup.reDraw();
	    sence.cardStack.reDraw();
	}


	// 手势事件
	function sencePoint(point) {
	    return {x : point.x / sence.size.width * sence.originalSize.width, y : point.y / sence.size.height * sence.originalSize.height};
	}
	
	sence.touchstart = function(point) {
	    this.cardGroup.touchdown(sencePoint(point));
	    this.cardGroup.reDraw();
	}

	sence.touchmove = function(point) {
	    this.cardGroup.touchdown(sencePoint(point));
	    this.cardGroup.reDraw();
	}
	
	sence.touchend = function() {
	    this.cardGroup.touchup(function(card){
		sence.cardStack.appendCard(card);
	    });
	    this.cardGroup.reDraw();
	}
	
	return sence;
    }
    // Canvas
    var canvas = document.getElementById("sence");
    var ctx = canvas.getContext("2d");
    var sence = createSence(ctx, {width : $('#sence').width(), height : $('#sence').height()});
    sence.reDraw();

    // 点击与滑动事件连到一起，处理卡片的选中
    canvas.addEventListener('touchstart', function(event){
        var touch = event.targetTouches[0];
	sence.touchstart({x : touch.pageX, y : touch.pageY});
    });
    
    canvas.addEventListener('touchmove', function(event){
	var touch = event.targetTouches[0];
	sence.touchmove({x : touch.pageX, y : touch.pageY});
    });

    // 抬手事件，连到出牌逻辑上
    canvas.addEventListener('touchend', function(){	
	sence.touchend();
    });

    // 摸牌模拟，暂时连到“摸牌”button上
    function touchCard() {
	var uno=[
	    'r0','r1','r2','r3','r4','r5','r6','r7','r8','r9','r+2','r1','r2','r3','r4','r5','r6','r7','r8','r9','r+2',
	    'y0','y1','y2','y3','y4','y5','y6','y7','y8','y9','y+2','y1','y2','y3','y4','y5','y6','y7','y8','y9','y+2',
	    'b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','b+2','b1','b2','b3','b4','b5','b6','b7','b8','b9','b+2',
	    'g0','g1','g2','g3','g4','g5','g6','g7','g8','g9','g+2','g1','g2','g3','g4','g5','g6','g7','g8','g9','g+2',
	    'w+4','w+4','w+4','w+4'
	];

	var index = Math.floor(Math.random() * 88);
	sence.cardGroup.appendCard(uno[index]);
	sence.cardGroup.reDraw();
    }
    

    $("#play").click(function() {
	//发送摸牌请求
	//socket.emit('touchCard', {from: from, room:roomNum});
	touchCard();
    });
    


});
