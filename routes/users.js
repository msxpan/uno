var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users');
});

router.post('/',  function(req, res, next) {
    res.cookie("name", req.body.name, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
});


module.exports = router;
