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

	// 如果卡片处于选中状态，弹起40px
	if (card.selected) {
	    cardframe.y -= 40;
	}
	
	// 画外框
	cornerRectPath(ctx, cardframe, 10);
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
	cornerRectPath(ctx, frame, 10);

	ctx.fillStyle = 'red';
	ctx.fill();
	
	// 椭圆
	ctx.save();
	ctx.translate(cardframe.x + cardframe.width / 2, cardframe.y + cardframe.height / 2);
	ctx.rotate(Math.PI / 6)
	ellipsePath(ctx, 0, 0, frame.width * 1.1, frame.height)
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.restore();

	//跟据card.name解卡后，绘制后续内容
		
    }


    // 创建卡片card对象
    function createCard(name) {
	var card = {};
	card.name = name;
	card.selected = false;     // 选中标识，选中的牌上移40px，在牌的reDraw函数中处理
	                           // card.frame 在加入卡组时，由在卡组中的位置给出frame

	// 是否点击此卡
	card.hitTest = function(point) {     
	    if (this.frame.x < point.x && point.x < this.frame.x + this.frame.width && this.frame.y < point.y && point.y < this.frame.y + this.frame.height) {
		return true;
	    }
	    return false;
	}

	// 重绘卡片
	card.reDraw = function(ctx) {
	    drawCard(ctx, this);
	}

	return card;
    }


    // 创建卡组cardGroup对象
    function createCardGroup(width, height) {
	var cardGroup = {};
	
	// CardGroup 定界
	var frame = {};
	frame.x = 160;
	frame.width = width - frame.x * 2;
	frame.height = 220;
	frame.y = height - frame.height;
	cardGroup.rect = frame;

	// CardGroup 卡组
	var cardArray = [];
	cardGroup.cards = cardArray;

	// 摸一张牌
	cardGroup.appendCard = function(card) {
	    var frame = {};

	    frame.width = 100;
	    frame.height = 150;

	    if (cardArray.length == 0) {
		// 初始位置
		frame.x = 10;
		frame.y = 10;
	    } else {
		// 以卡组中最后一张的位置为基准，进行相对调整
		var lastCard = cardArray[cardArray.length - 1];
		
		if (lastCard.frame.x + 60 + frame.width > this.rect.width) {
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
	    cardArray.push(card);
	}

	// CardGroup 重绘
	cardGroup.reDraw = function(ctx) {
	    // 清除cardGroup的绘制区，上下左右各加40px，把选中弹起的卡片也擦掉
	    ctx.clearRect(this.rect.x - 40, this.rect.y - 40, this.rect.width + 80, this.rect.height + 80);

	    // CardGroup的区域线，辅助用，最后删掉
	    ctx.beginPath();
	    ctx.moveTo(this.rect.x, this.rect.y + this.rect.height);
	    ctx.lineTo(this.rect.x, this.rect.y);
	    ctx.lineTo(this.rect.x + this.rect.width, this.rect.y);
	    ctx.lineTo(this.rect.x + this.rect.width, this.rect.y + this.rect.height);
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = 'black';
	    ctx.stroke();

	    // 卡组重绘
	    ctx.save();
	    ctx.translate(this.rect.x, this.rect.y);       // 坐标系转换到CardGroup区
	    
	    for (i = 0; i < cardArray.length; ++i) {       // 调用每张Card的重绘
		cardArray[i].reDraw(ctx);
	    }

	    ctx.restore();
	}

	// 点击检测
	cardGroup.hitTest = function (point) {
	    if (this.rect.x < point.x && point.x < this.rect.x + this.rect.width && this.rect.y < point.y && point.y < this.rect.y + this.rect.height) {
		return true;
	    }
	    return false;						     
	}

	// 收到点击事件
	cardGroup.touchdown = function (point) {
	    if (this.hitTest(point)) {

		// 清理卡组的选中事件，所有牌落回基线
		for (i = 0; i < cardArray.length; ++i) {
		    var card = cardArray[i];
		    card.selected = false;
		}

		// 根据卡组中每张牌的坐标，判断哪张卡版被选中
		for (i = cardArray.length - 1; i >= 0; --i) {
		    var card = cardArray[i];
		    var cardPoint = {};

		    // 将全局坐标切换到cardGroup坐标，用作卡组判断
		    cardPoint.x = point.x - this.rect.x;
		    cardPoint.y = point.y - this.rect.y;

		    if (card.hitTest(cardPoint)) { // 调用每张card的hitTest
			card.selected = true;  // 点中的卡设为selected
			break;
		    }
		}
	    }
	}

	cardGroup.touchup = function (point) {
	    // TODO 出牌
	}


	
	return cardGroup;
    }

    // 摸牌模拟，暂时连到“摸牌”button上
    function touchCard() {
	cardGroup.appendCard(createCard("r1"));
	cardGroup.reDraw(ctx);
    }
    

    // 原始场景尺寸
    var regularWidth = 1024;
    var regularHeight = 576;

    // Canvas
    var sence = document.getElementById("sence");
    var ctx = sence.getContext("2d");

    // 真实投影场景尺寸
    var realWidth = $('#sence').width();
    var realHeight = $('#sence').height();

    // 创建用户CardGroup
    var cardGroup = createCardGroup(regularWidth, regularHeight);

    // 全局坐标系变换，从原始场景向真实场景投射，变换后所有场景尺寸变为以1024*576为基准
    ctx.scale(realWidth/regularWidth, realHeight/regularHeight);

    // 点击与滑动事件连到一起，处理卡片的选中
    sence.addEventListener('touchstart', function(event){
	// 真实点击坐标向原始场景坐标变换
        var touch = event.targetTouches[0];
	var point = {};
	point.x = touch.pageX / realWidth * regularWidth;
	point.y = touch.pageY / realHeight * regularHeight;

	// 检测cardGroup的按下事件，并重绘
	cardGroup.touchdown(point);
	cardGroup.reDraw(ctx);
    });
    
    sence.addEventListener('touchmove', function(event){
	var touch = event.targetTouches[0];
	var point = {};
	point.x = touch.pageX / realWidth * regularWidth;
	point.y = touch.pageY / realHeight * regularHeight;
	cardGroup.touchdown(point);
	cardGroup.reDraw(ctx);
    });

    // 抬手事件，连到出牌逻辑上
    sence.addEventListener('touchend', function(event){	
     
    });


    // 临时事件，摸一张牌
    touchCard();

    $("#play").click(function() {
	//发送摸牌请求
	//socket.emit('touchCard', {from: from, room:roomNum});
	touchCard();
    });
    


});
