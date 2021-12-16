const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const {
	ACCOUNT_TYPE_DEFAULT
} = require("../../config/key");
const {
	Schema
} = mongoose;
const _ = require("lodash");
const UserSchema = Schema({
	username: {
		type: String,
		// required: true,
		// unique: true,
		// trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		validate: {
			validator: validator.isEmail,
		},
	},
	phoneNumber: {
		type: Number,
		required: true,
		unique: true,
	},
	role: {
		type: String,
		default: "client", // user type: client,admin,artist
	},
	password: {
		type: String,
		minlength: 6,
		required: true,
	},
	name: {
		type: String,
		trim: true,
		required: true,
	},
	joinDate: {
		type: Date,
		default: Date.now,
	},
	accountType: {
		type: String,
		default: ACCOUNT_TYPE_DEFAULT,
	},
	activeStatus: {
		type: Boolean,
		default: true,
	},
	flag: {
		type: Boolean,
		default: true,
	},
});

UserSchema.pre("save", function (next) {
	let user = this;
	if (user.isModified("password")) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hashed) => {
				user.password = hashed;
				next();
			});
		});
	} else {
		next();
	}
});

module.exports = User = mongoose.model("user", UserSchema);