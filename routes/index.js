var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies.name != null) {
	res.redirect('/halls');
    } else {
	res.redirect('/users');
    }
});

module.exports = router;
