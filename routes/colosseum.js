var express = require('express');
var router = express.Router();

var roomName;

router.get('/', function(req, res, next) {
    if (req.cookies.name == null) {
	res.redirect('/');
	return;
    }

    if (req.cookies.room == null) {
	res.redirect('/halls');
	return;
    }

    roomName = 'room' + req.cookies.room;
    res.render('colosseum', { title: req.cookies.room });
});

module.exports = router;
