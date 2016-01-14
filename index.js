var app = require('express')();	
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});




var unoOriginal=[
	'r0','r1','r2','r3','r4','r5','r6','r7','r8','r9','r10','r11','r12',
    'y0','y1','y2','y3','y4','y5','y6','y7','y8','y9','y10','y11','y12',
    'b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12',
    'g0','g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12',
];
var unoTotal=getArrayItems(unoOriginal,48);

io.on('connection', function(socket){

	io.emit('unoInit',unoTotal)
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});

	socket.on('deal',function(data){
		io.emit('initCard',unoTotal.slice(0,7))
		unoTotal.splice(0,7)
		io.emit('unoTotal',unoTotal)
	})

	// socket.on('sendCard',function(data){
		// io.emit('unoTotal',unoTotal.remove(data))
	// })
	io.of('/chat').clients(function(error, clients){
    	if (error) throw error;
    	console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
 	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


// 更新牌组
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
