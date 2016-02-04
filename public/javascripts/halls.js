$(document).ready(function() {
    function post(URL, PARAMS) {        
	var temp = document.createElement("form");        
	temp.action = URL;        
	temp.method = "post";        
	temp.style.display = "none";        
	for (var x in PARAMS) {        
            var opt = document.createElement("textarea");        
            opt.name = x;        
            opt.value = PARAMS[x];        
            // alert(opt.name)        
            temp.appendChild(opt);        
	}        
	document.body.appendChild(temp);        
	temp.submit();        
	return temp;        
    }        

    //调用方法 如        
    $('.card-bg').on('click',function(){
	post('', {room:$(this).attr('room')}); 
    })
})
