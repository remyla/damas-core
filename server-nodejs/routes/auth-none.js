var express = require('express');
var router = express.Router();

router.use(function(req, res, next ){                                                                           
	req.user = { }
	next();
});

router.get("/api/verify", function (req, res) {
	return res.status(200).json({});
});

/*
router.route("/api/signIn").post(authenticate, function (req, res, next) {
	return res.status(200).json(req.user);
});
*/

module.exports = router;
