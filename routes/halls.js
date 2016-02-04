var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (req.cookies.name == null) {
	res.redirect('/');
	return;
    }
    
    if (req.cookies.room) {
	res.redirect('/colosseum');	
    } else {
	res.render('halls');
    }
});

router.post('/', function(req, res, next) {
    res.cookie("room", req.body.room, {maxAge: 1000*60*60*24*30});
    res.redirect('colosseum');
});

module.exports = router;
