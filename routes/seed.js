const router = require("express").Router();
const { licenseBody, superAdminBody } = require("../config/variable");
let User = require("mongoose").model("user");
// const License = require("../models/user/License.js");

router.get("/init", async (req, res) => {
	insertUser(res);
});

// insertLicense = async function(res) {
// 	const isLicenseCodeExist = await License.findOne({
// 		licenseCode: licenseBody.licenseCode,
// 		flag: true
// 	});
// 	if (isLicenseCodeExist)
// 		return res.json({
// 			success: false,
// 			message: "License code already exist."
// 		});
// 	const licenseModel = new License(licenseBody);
// 	licenseModel
// 		.save()
// 		.then(async licenseData => {
// 			if (licenseData) {
// 				insertUser(licenseData._id, res);
// 			} else res.json({ success: false });
// 		})
// 		.catch(err => {
// 			console.log(err);
// 		});
// };

insertUser = async function (res) {
	// superAdminBody.license = license;
	const userData = new User(superAdminBody);
	let result = await userData.save();
	if (!result)
		return res.json({
			success: false,
			message: "cannot seed now",
		});
	res.json({
		success: true,
		message: "Superadmin successfully created !",
	});
};
module.exports = router;
