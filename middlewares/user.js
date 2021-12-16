const User = require("../models/user/User");
const ObjectId = require("mongoose").Types.ObjectId;
const validator = require("validator");
const jwt = require("jsonwebtoken");
var path = require("path");
var fs = require("fs");
const { JWT_SECRET } = require("../config/key");
const validateRegisterInput = require("../services/validation/register");

const registerUser = async (req, res, next) => {
	User.findOne({ phoneNumber: req.body.phoneNumber }).then(
		async (existingPhoneUser) => {
			if (existingPhoneUser) {
				return res.status(400).json({
					status: false,
					message: "PhoneNumber already exists",
					data: {},
				});
			} else {
				let errors = await validateUser(
					req.body.email,
					req.body.phoneNumber,
					// req.body.username
				);
				if (!errors.success) return res.status(errors.statusCode).json(errors);

				var userBody = {};
				if (req.body.name) userBody.name = req.body.name;
				userBody.email = req.body.email;
				if (req.body.username) userBody.username = req.body.username;
				if (req.body.phoneNumber) userBody.phoneNumber = req.body.phoneNumber;
				// if (req.body.photo) userBody.photo = req.body.photo;
				if (req.body.flag) userBody.flag = req.body.flag;
				if (req.body.role) userBody.role = req.body.role;
				if (req.body.password) userBody.password = req.body.password;

				if (req.files) {
					const file = req.files.avatar;
					const systemImageUrl = `${__dirname}/../public/files/users/${file.name}`;
					// const imageUrlToSave = `public/files/stories/${file.name}`;
					const imageUrlToSave = `public/files/users/${file.name}`;
					userBody.avatar = imageUrlToSave;
					file.mv(systemImageUrl, function (err) {
						if (err) {
							console.log(err);
							res.status(500).json({
								status: false,
								message: "Cannot upload the file",
								data: {},
							});
						}
					});
				}

				// check if email exists
				const userModel = new User(userBody);
				userModel
					.save()
					.then((savedUser) => {
						if (savedUser) {
							const JWTPayload = {
								id: savedUser._id,
								phoneNumber: savedUser.phoneNumber,
								role: savedUser.role,
							};
							//sign Token
							jwt.sign(
								JWTPayload,
								JWT_SECRET,
								{ expiresIn: 36000 },
								(err, token) => {
									if (!err) {
										return res.json({
											status: true,
											message: "User registered successfully",
											data: {
												name: savedUser.name,
												email: savedUser.email,
												_id: savedUser._id,
												role: savedUser.role,
												phoneNumber: savedUser.phoneNumber,
											},
											token: "Bearer " + token,
										});
									} else {
										return res.json({
											status: false,
											token: null,
											message: "Cannot create token",
											data: {},
											errors: err,
										});
									}
								}
							);
							// res.json({
							// 	success: true,
							// 	message: "User registered successfully",
							// 	data: {
							// 		name: savedUser.name,
							// 		email: savedUser.email,
							// 		_id: savedUser._id,
							// 		role: savedUser.role,
							// 		phoneNumber: savedUser.phoneNumber,
							// 	},
							// });
						} else {
							res.json({
								success: false,
								message: "User registration failed",
								data: {},
							});
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		}
	);
};
// async function validateUser(email, phoneNumber, username) {
async function validateUser(email, phoneNumber) {
	try {
		// const userFoundFromUsername = await User.findOne({
		// 	username,
		// 	flag: true,
		// });
		// // when username already exists in database
		// if (userFoundFromUsername)
		// 	return {
		// 		success: false,
		// 		statusCode: 404,
		// 		message: "Username already exists",
		// 		data: {},
		// 	};

		const userFoundFromEmail = await User.findOne({
			email,
			flag: true,
		});
		// when email already exists in database
		if (userFoundFromEmail)
			return {
				success: false,
				statusCode: 404,
				message: "Email already exists",
				data: {},
			};

		// check if phoneNumber exists

		const userFoundFromPhoneNumber = await User.findOne({
			phoneNumber,
			flag: true,
		});
		if (userFoundFromPhoneNumber)
			return {
				success: false,
				statusCode: 404,
				message: "PhoneNumber already exists",
				data: {},
			};
		return {
			success: true,
		};
	} catch (error) {
		console.log(error);
		return {
			success: false,
			statusCode: 404,
			error,
		};
	}
}

module.exports = { registerUser, validateUser };
