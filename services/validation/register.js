const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = (data) => {
	let errors = {};

	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";
	data.name = !isEmpty(data.name) ? data.name : "";
	data.username = !isEmpty(data.username) ? data.username : "";
	data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : "";
	// data.address = !isEmpty(data.address) ? data.address : "";

	if (isEmpty(data.phoneNumber)) {
		errors.message = "PhoneNumber field is required";
		errors.status = false;
		errors.data = {};
	}

	// if (isEmpty(data.username)) {
	// 	errors.message = "UserName field is required";
	// 	errors.status = false;
	// 	errors.data = {};
	// }

	if (data.refer == 2) {
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
	}

	if (validator.isEmpty(data.email)) {
		errors.message = "Email field is required";
		errors.status = false;
		errors.data = {};
	}

	if (validator.isEmpty(data.name)) {
		errors.message = "Full Name field is required";
		errors.status = false;
		errors.data = {};
	}
	// if (!validator.isLength(data.first, { min: 2, max: 40 })) {
	// 	errors.first = "Invalid length of Fullname";
	// }

	// if (!validator.isLength(data.last, { min: 2, max: 40 })) {
	// 	errors.first = "Invalid length of Fullname";
	// }

	// if (
	// 	!(
	// 		data.gender === "male" ||
	// 		data.gender === "female" ||
	// 		data.gender === "other"
	// 	)
	// ) {
	// 	errors.gender = "Gender is invalid";
	// }

	// if (validator.isEmpty(data.phone)) {
	// 	errors.phone = "Phone field is required";
	// }
	// if (validator.isEmpty(data.address)) {
	// 	errors.address = "Address field is required";
	// }

	if (!validator.isEmail(data.email)) {
		errors.message = "Email is invalid";
		errors.status = false;
		errors.data = {};
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
