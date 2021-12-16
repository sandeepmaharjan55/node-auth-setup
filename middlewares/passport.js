const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { JWT_SECRET } = require("../config/key");
const User = require("../models/user/User");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET;

module.exports = (passport) => {
	passport.use(
		new JwtStrategy(opts, (jwt_payload, done) => {
			User.findOne({ _id: jwt_payload.id, flag: true })
				.then((user) => {
					if (user) {
						// if (user.privilege === "superadmin") {
						// 	user.isAdmin = true;
						// }
						return done(null, user);
					}
					return done(null, false);
				})
				.catch((err) => done(err, false));
		})
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
};
