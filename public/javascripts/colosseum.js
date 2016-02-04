function getCookie(key) {
    if (document.cookie.length > 0) {
	start = document.cookie.indexOf(key + "=");
	
	if (start != -1) { 
	    start = start + key.length + 1;
	    end = document.cookie.indexOf(";", start);

	    if (end == -1) {
		end = document.cookie.length;
	    }

	    return document.cookie.substring(start, end)
	} 
    }
    
    return "";
}

var socket = io();
socket.emit('enter', {user : getCookie('name'), room : getCookie('room')});
socket.on('enteredUser', function(args) {
    console.log(args);
});
