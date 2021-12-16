const router = require("express").Router();
const path = require("path");
const fs = require("fs");

const uploadFile = (file, storyId) => {
	// let uploadFile = req.files.file;
	// let uploadFile = req.files.file;
	// console.log("name", uploadFile);
	const name = file.name;
	console.log("uploaded", name);
	// const md5 = uploadFile.md5;
	var fileType = name.substr(name.indexOf("."));
	console.log("fileType", fileType);

	const newName = `${storyId}_story${fileType}`;
	console.log("newName", newName);

	file.mv(`${__dirname}/../public/files/${name}`, function (err) {
		if (err) {
			// return res.status(500).json({ success: false, err });
			return false;
		}
		// return res.status(200).json({ success: true, name });
		return { status: true };
	});
};

// router.get("/delete/:image", async (req, res, next) => {
// 	const toBeDeletedFileName = req.params.image;
// 	console.log("toBeDeleted", toBeDeletedFileName);

// 	const fromFilePath = path.resolve(
// 		`${__dirname}/../../public/files/${toBeDeletedFileName}`
// 	);
// 	const splitted = toBeDeletedFileName.split(".");
// 	const toFilePath = path.resolve(
// 		`${__dirname}/../../public/deleted/${splitted[0]}_${Date.now()}.${
// 			splitted[1]
// 		}`
// 	);

// 	await fs.renameSync(fromFilePath, toFilePath);
// 	return res.status(200).json({ status: "uploaded", toFilePath });
// });

const getImage = (imageName) => {
	// let file = req.params.imagename;
	const directory = `${__dirname}/../public/files/`;
	const filePath = path.resolve(`${directory}${imageName}`);
	console.log("image", filePath);
	if (fs.existsSync(filePath)) {
		// res.sendFile(filePath);
		return sendFile(filePath);
	} else {
		const filePath = path.resolve(`${directory}notfound.jpg`);
		// res.sendFile(filePath);
		return sendFile(filePath);
	}
};

module.exports = { getImage, uploadFile };
