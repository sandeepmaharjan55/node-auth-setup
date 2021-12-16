const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = (data) => {
	let errors = {};

	data.emailOrUsername = !isEmpty(data.emailOrUsername)
		? data.emailOrUsername
		: "";
	data.password = !isEmpty(data.password) ? data.password : "";

	if (validator.isEmpty(data.emailOrUsername)) {
		errors.emailOrUsername = "UserName field is required";
	}

	if (validator.isEmpty(data.password)) {
		errors.password = "Password field is required";
	}

	if (!validator.isLength(data.password, { min: 6, max: 30 })) {
		errors.password = "Password must be at least 6 characters";
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
