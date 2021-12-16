const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
	// Gather the jwt access token from the request header,
	// if it has valid token the decode it
	// and if role === "admin" found in token
	// set isAdmin to true else dont set,
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) next();
	else {
		jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
			if (err) {
				return res.sendStatus(403).json({
					message: "Cannot proceed.",
				});
			}
			req.user._id = user._id;
			req.user.role = user.role;
			return next();
		});
	}
};
