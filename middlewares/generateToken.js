const { JWT_SECRET } = require("../config/key");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const user = req.user;
	const JWTPayload = {
		id: user.id,
		email: user.email,
	};
	//sign Token
	jwt.sign(JWTPayload, JWT_SECRET, (err, token) => {
		if (!err) {
			token = "Bearer " + token;
			req.token = token;
			next();
		} else {
			return res.status(400).error("Cannot proceed");
		}
	});
};
