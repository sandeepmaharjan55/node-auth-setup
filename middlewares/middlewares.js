const bodyParser = require("body-parser");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const path = require("path");
module.exports = app => {
	app.use(
		fileUpload({
			useTempFiles: true,
			safeFileNames: true,
			preserveExtension: true,
			tempFileDir: path.join(__dirname, "../public", "files", "temp")
		})
	);

	app.use(bodyParser.json({ limit: "50mb" }));
	app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

	//passport middleware config
	app.use(passport.initialize());
	require("./passport")(passport);
};
