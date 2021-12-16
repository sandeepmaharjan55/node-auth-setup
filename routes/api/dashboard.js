const router = require("express").Router();
const _ = require("lodash");
const passport = require("passport");
var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../../models/user/User");
const Destination = require("../../models/destination/destination");
const auth = passport.authenticate("jwt", { session: false });
const { isAdmin } = require("../../middlewares/checkRole");

router.get("/list", auth, isAdmin, async (req, res) => {
  try {
    let artistCount = await User.find({
      role: "artist",
      flag: true,
      activeStatus: true,
    }).countDocuments();
    let clientCount = await User.find({
      role: "client",
      flag: true,
      activeStatus: true,
    }).countDocuments();
    let destinationsCount = await Destination.find({
      flag: true,
    }).countDocuments();
    res.json({
      status: true,
      message: "Dashboard data fetched successfully",
      data: {
        artistCount: artistCount,
        clientCount: clientCount,
        destinationsCount: destinationsCount,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Bad request",
      data: {},
    });
  }
});

module.exports = router;
