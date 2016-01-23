$(document).ready(function() {
    function cornerRectPath(ctx, frame, corner) {
	ctx.beginPath();
	ctx.moveTo(frame.x + corner, frame.y);
	ctx.arcTo(frame.x + frame.width, frame.y, frame.x + frame.width, frame.y + corner, corner);
	ctx.arcTo(frame.x + frame.width, frame.y + frame.height, frame.x + frame.width - corner, frame.y + frame.height, corner);
	ctx.arcTo(frame.x, frame.y + frame.height, frame.x, frame.y + frame.height - corner, corner);
	ctx.arcTo(frame.x, frame.y, frame.x + corner, frame.y, corner);
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
    
    function drawCard(ctx, card) {
	var cardframe = jQuery.extend(card.frame);
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
		
    }

    
    function createCard(name) {
	var card = {};
	card.name = name;
	card.selected = false;

	card.hitTest = function(point) {
	    if (this.frame.x < point.x && point.x < this.frame.x + this.frame.width && this.frame.y < point.y && point.y < this.frame.y + this.frame.height) {
		return true;
	    }
	    return false;
	}
	
	card.reDraw = function(ctx) {
	    drawCard(ctx, this);
	}

	return card;
    }

    
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

	cardGroup.appendCard = function(card) {
	    var frame = {};

	    frame.width = 100;
	    frame.height = 150;

	    if (cardArray.length == 0) {
		// 初始
		frame.x = 10;
		frame.y = 10;
	    } else {
		var lastCard = cardArray[cardArray.length - 1];
		if (lastCard.frame.x + 60 + frame.width > this.rect.width) {
		    // 折行
		    frame.x = 10;
		    frame.y = lastCard.frame.y + 60;
		} else {
		    // 加在后面
		    frame.x = lastCard.frame.x + 60;
		    frame.y = lastCard.frame.y;
		}
	    }
	    
	    
	    
	    card.frame = frame;
	    cardArray.push(card);
	}

	// CardGroup 重绘
	cardGroup.reDraw = function(ctx) {
	    ctx.clearRect(this.rect.x - 40, this.rect.y - 40, this.rect.width + 80, this.rect.height + 80);
	    
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
	    ctx.translate(this.rect.x, this.rect.y)
	    
	    for (i = 0; i < cardArray.length; ++i) {
		cardArray[i].reDraw(ctx);
	    }

	    ctx.restore();
	}

	// 点击测试
	cardGroup.hitTest = function (point) {
	    if (this.rect.x < point.x && point.x < this.rect.x + this.rect.width && this.rect.y < point.y && point.y < this.rect.y + this.rect.height) {
		return true;
	    }
	    return false;						     
	}

	// 点击
	cardGroup.touchdown = function (point) {
	    if (this.hitTest(point)) {
		for (i = 0; i < cardArray.length; ++i) {
		    var card = cardArray[i];
		    card.selected = false;
		}
		
		for (i = cardArray.length - 1; i >= 0; --i) {
		    var card = cardArray[i];
		    var cardPoint = {};
		    
		    cardPoint.x = point.x - this.rect.x;
		    cardPoint.y = point.y - this.rect.y;

		    if (card.hitTest(cardPoint)) {
			card.selected = true;
			break;
		    }
		}
	    }
	}

	cardGroup.touchup = function (point) {

	}


	
	return cardGroup;
    }

    function touchCard() {
	cardGroup.appendCard(createCard("r1"));

	cardGroup.reDraw(ctx);
    }
    
    
    var regularWidth = 1024;
    var regularHeight = 576;

    var sence = document.getElementById("sence");
    var ctx = sence.getContext("2d");

    var realWidth = $('#sence').width();
    var realHeight = $('#sence').height();

    var cardGroup = createCardGroup(regularWidth, regularHeight);
    
    ctx.scale(realWidth/regularWidth, realHeight/regularHeight);
    sence.addEventListener('touchstart', function(event){
        var touch = event.targetTouches[0];
	var point = {};
	point.x = touch.pageX / realWidth * regularWidth;
	point.y = touch.pageY / realHeight * regularHeight;
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
    sence.addEventListener('touchend', function(event){	
     
    });

    
    touchCard();

      $("#play").click(function() {
    //发送摸牌请求
      //socket.emit('touchCard', {from: from, room:roomNum});
	  touchCard();
      });
    


});
