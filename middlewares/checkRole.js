const passport = require("passport");

function isAdmin(req, res, next) {
	if (!req.user || req.user.role !== "admin") {
		return res
			.status(401)
			.json({
				status: false,
				message: "Unauthorized Access",
				data: {}
			});
	}
	return next();
}

function isClient(req, res, next) {
	if (!req.user || req.user.role !== "client") {
		return res
			.status(401)
			.json({
				status: false,
				message: "Unauthorized Access",
				data: {}
			});
	}
	return next();
}

function isArtist(req, res, next) {
	if (req.user.role !== "artist") {
		return res
			.status(401)
			.json({
				status: false,
				message: "Unauthorized Access",
				data: {}
			});
	}
	return next();
}

function checkAuthorization(req, res, next) {
	let authorization = req.get("Authorization");

	if (authorization) {
		return passport.authenticate("jwt", {
			session: false
		});
		console.log(req.user);
		return next();
	}

	return next();
}

function isAdminOrArtist(req, res, next) {
	// if (req.user.role == "client") {
		if (req.user.role !== "admin" && req.user.role !== "artist") {
		// console.log(req.user.role);
		return res
			.status(401)
			.json({
				status: false,
				message: "Unauthorized Access",
				data: {}
			});
	}
	return next();
}

module.exports = {
	isAdmin,
	isClient,
	isArtist,
	checkAuthorization,
	isAdminOrArtist
};