module.exports = function(app){
	app.use(function(req, res, next ){
		req.user = {
			username: req.connection.remoteAddress
		}
		next();
	});
	app.get("/api/verify", function (req, res) {
		return res.status(200).json({});
	});
}
