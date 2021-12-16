const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = (data) => {
	let errors = {};

	data.emailOrPhoneNumber = !isEmpty(data.emailOrPhoneNumber)
		? data.emailOrPhoneNumber
		: "";
	data.password = !isEmpty(data.password) ? data.password : "";

	if (validator.isEmpty(data.emailOrPhoneNumber)) {
		errors.message = "Please Enter Email or PhoneNumber";
		errors.status = false;
		errors.data = {};
	}

	if (validator.isEmpty(data.password)) {
		errors.message = "Password field is required";
		errors.status = false;
		errors.data = {};
	}

	if (!validator.isLength(data.password, { min: 6, max: 30 })) {
		errors.message = "Password must be at least 6 characters";
		errors.status = false;
		errors.data = {};
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
