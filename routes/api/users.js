const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../../models/user/User");
const { registerUser } = require("../../middlewares/user");

const _ = require("lodash");
const passport = require("passport");
const auth = passport.authenticate("jwt", {
  session: false,
});
// const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const validateRegisterInput = require("../../services/validation/register");
const { isAdmin, isClient, isArtist } = require("../../middlewares/checkRole");
// const validateEditProfileInput = require("../../services/validation/updateProfile");
const validateLoginInput = require("../../services/validation/login");
const validateMobileLoginInput = require("../../services/validation/mobileLogin");
const generateToken = require("../../middlewares/generateToken");
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  ACCOUNT_TYPE_GOOGLE,
  ACCOUNT_TYPE_FACEBOOK,
  ACCOUNT_TYPE_DEFAULT,
} = require("../../config/key");
const validator = require("validator");
var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isEmpty = require("../../services/validation/is-empty");

// var log = require("../../middlewares/log");

// router.get("/home", auth, isClient, (req, res) => {
//   console.log(req.user._id);
//   res.send("hello");
// });

// @route:  POST api/users/register
// @desc:   register the user
// @access: public
router.post(
  "/register",
  // passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    next();

    //req.license = req.next();
    //check and save
  },
  registerUser
);

router.post(
  "/status",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const _id = req.body.id;
    const status = req.body.status;
    const userProfile = await User.findById({
      _id,
      flag: true,
    });
    if (!userProfile) {
      return res.json({
        success: false,
        message: "no user",
      });
    }
    User.findOneAndUpdate(
      {
        _id,
        flag: true,
      },
      {
        $set: {
          activeStatus: status,
        },
      },
      {
        new: true,
      }
    )
      .then((profile) => {
        if (profile.activeStatus == false) var disableenable = "disabled";
        else var disableenable = "enabled";
        res.json({
          status: true,
          message: "Successfully " + disableenable + " user",
          data: {
            name: profile.name,
            email: profile.email,
          },
        });
      })
      .catch((err) => {
        res.json({
          success: false,
          err,
        });
      });
  }
);

// @route:  POST api/users/edit
// @desc:   edit the user
// @access: public

router.post(
  "/edit",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const _id = req.body._id;
    var userBody = {};

    // userBody.password = req.body.password;
    if (req.body.name) userBody.name = req.body.name;
    if (req.body.gender) userBody.gender = req.body.gender;
    if (req.body.address) userBody.address = req.body.address;
    if (req.body.activeStatus) userBody.activeStatus = req.body.activeStatus;

    var query = false;
    const userProfile = await User.findById({
      _id,
      flag: true,
    });
    if (!userProfile) {
      return res.json({
        success: false,
        message: "no user",
      });
    }
    if (userProfile.phoneNumber !== req.body.phoneNumber) {
      if (!query)
        query = {
          flag: true,
          $or: [],
        };
      userBody.phoneNumber = req.body.phoneNumber;
      query.$or.push({
        phoneNumber: req.body.phoneNumber,
      });
    }
    if (userProfile.email !== req.body.email) {
      if (!query)
        query = {
          flag: true,
          $or: [],
        };
      userBody.email = req.body.email;
      query.$or.push({
        email: req.body.email,
      });
    }
    if (query) {
      console.log("query", query);

      const existingUser = await User.find(query);
      console.log("existingUser", typeof existingUser, existingUser);

      if (!isEmpty(existingUser)) {
        return res.json({
          message: "Username or email already exists",
        });
      }
    }
    User.findOneAndUpdate(
      {
        _id,
        flag: true,
      },
      {
        $set: userBody,
      },
      {
        new: true,
      }
    )
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => {
        res.json({
          success: false,
          err,
        });
      });
  }
);

// @route:  POST api/users/login
// @desc:   login the user and response the token
// @access: public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // console.log(req.body);
  //check validation
  if (!isValid) {
    console.log(errors);
    return res.json({
      isError: true,
      errors,
    });
  }

  const { emailOrUsername, password } = req.body;

  const isEmail = validator.isEmail(emailOrUsername);
  User.findOne(
    isEmail
      ? {
          email: emailOrUsername,
          flag: true,
          role: "admin",
        }
      : {
          username: emailOrUsername,
          flag: true,
          role: "admin",
        }
  ).then(async (user) => {
    if (user) {
      if (user.flag) {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return console.log(err);
          }
          if (isMatch) {
            // user matched

            const JWTPayload = {
              id: user._id,
              phoneNumber: user.phoneNumber,
              username: user.username,
              role: user.role,
            };
            //sign Token
            jwt.sign(
              JWTPayload,
              JWT_SECRET,
              {
                expiresIn: 36000,
              },
              (err, token) => {
                if (!err) {
                  return res.json({
                    isError: false,
                    userDetail: _.pick(user, ["email", "role", "name"]),
                    token: "Bearer " + token,
                    errros: null,
                  });
                } else {
                  console.log(err);
                  return res.json({
                    isError: true,
                    token: null,
                    errors: err,
                  });
                }
              }
            );
          } else {
            //password do not match
            errors.password = "Password do not match";
            return res.status(400).json({
              isError: true,
              errors,
              token: null,
            });
          }
        });
      } else {
        errors.message = "You cannot Login with this email";
        return res.json({
          isError: true,
          errors,
          token: null,
        });
      }
    } else {
      //no user with such email
      errors.email = "No user with this email";
      return res.status(404).json({
        isError: true,
        errors,
        token: null,
      });
    }
  });
});

// @route:  POST api/users/mobile/login
// @desc:   login the user and response the token
// @access: public
router.post("/mobile/login", (req, res) => {
  const { errors, isValid } = validateMobileLoginInput(req.body);

  //check validation
  if (!isValid) {
    return res.json(errors);
  }

  const { emailOrPhoneNumber, password } = req.body;

  const isEmail = validator.isEmail(emailOrPhoneNumber);
  User.findOne(
    isEmail
      ? {
          email: emailOrPhoneNumber,
          flag: true,
          role: {
            $in: ["artist", "client"],
          },
        }
      : {
          phoneNumber: emailOrPhoneNumber,
          flag: true,
          role: {
            $in: ["artist", "client"],
          },
        }
  ).then(async (user) => {
    if (user) {
      if (user.flag) {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return console.log(err);
          }
          if (isMatch) {
            // user matched

            const JWTPayload = {
              id: user._id,
              phoneNumber: user.phoneNumber,
              role: user.role,
            };
            //sign Token
            jwt.sign(
              JWTPayload,
              JWT_SECRET,
              {
                expiresIn: 36000,
              },
              (err, token) => {
                if (!err) {
                  return res.json({
                    status: true,
                    message: "Successfully logged in",
                    data: {
                      name: user.name,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      currency: user.currency,
                      appointmentPrice: user.appointmentPrice,
                      // appointmentPrice: await functions.currencyConverter(user.appointmentPrice,user.currency,user._id),
                      _id: user._id,
                      role: user.role,
                      coverPicture: user.coverPicture,
                      profilePicture: user.profilePicture,
                      activeStatus: user.activeStatus,
                      address: user.address,
                      latitude: user.latitude,
                      longitude: user.longitude,
                      city: user.city,
                      country: user.country,
                      gender: user.gender,
                      Bookmarks: user.Bookmarks,
                      joinDate: user.joinDate,
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
          } else {
            //password do not match
            errors.password = "Password do not match";
            return res.status(400).json({
              status: false,
              message: errors.password,
              token: null,
              data: {},
            });
          }
        });
      } else {
        errors.message = "You cannot Login with this email";
        return res.json({
          status: false,
          message: errors.message,
          token: null,
          data: {},
        });
      }
    } else {
      //no user with such email
      errors.email = "No user with this email";
      return res.status(404).json({
        status: false,
        message: errors.email,
        token: null,
        data: {},
      });
    }
  });
});
// @route:  GET api/users/current
// @desc:   get the details of currently logged in user
// @access: private
router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false,
  }),
  generateToken,
  (req, res) => {
    res.json(req.user);
    const errors = {};

    User.findOne({
      _id: req.user.id,
      flag: true,
      license: ObjectId(req.user.license),
    }).then((user) => {
      if (!user) {
        errors.username = "invalid username";
        return res.status(404).json(errors);
      }
      console.log(user);
    });
  }
);

// @route:  GET api/users/username
// @desc:   response the userDetails by each username
// @access: private
router.get(
  "/username/:username",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const username = req.params.username;
    const errors = {};
    await User.findOne({
      username,
      flag: true,
      license: ObjectId(req.user.license),
    }).then((user) => {
      if (!user) {
        errors.username = "invalid username";
        return res.status(404).json(errors);
      }
      res.json(user);
    });
  }
);

// @route:  GET api/users/email
// @desc:   response the userDetails by each email
// @access: private
router.get(
  "/admin/:adminId",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const id = req.params.adminId;
    await User.findOne({
      _id: id,
      flag: true,
    }).then((user) => {
      if (!user) {
        res.json({
          status: false,
          message: "No User by this id",
          data: {},
        });
      }
      res.json({
        status: true,
        message: "Successfully fetch user by id",
        data: user,
      });
    });
  }
);

// @route:  GET api/users/list
// @desc:   GET ALL USER LIST
// @access: private
router.get(
  "/list",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    try {
      const result = await User.find(
        {
          flag: true,
          role: "admin",
        },
        "_id email name role"
      );
      if (result) return res.json(result);
      else
        return res.status(404).json({
          message: "Zero Users",
        });
    } catch (error) {
      res.status(400).json({
        message: "Bad request",
      });
    }
  }
);

// client by id view api
router.post(
  "/clientView",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const clientId = req.body.clientId;
    try {
      const result = await User.findById({
        _id: clientId,
      });
      if (result) return res.json(result);
      else
        return res.status(404).json({
          message: "Zero Users",
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Bad request",
      });
    }
  }
);

// @route:  POST api/users
// @desc:	DELETE USERS
// @access: private

router.post(
  "/remove",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    console.log(req.body.id);
    var _id = req.body.id;
    const userProfile = await User.findByIdAndUpdate(
      {
        _id,
        flag: true,
      },
      {
        $set: {
          flag: false,
        },
      },
      {
        new: true,
      }
    );
    if (userProfile) {
      res.json({
        message: "Successfully delete users",
      });
    } else {
      res.json({
        message: "Cannot delete users",
      });
    }
  }
);

router.post("/google-login", async (req, res) => {
  const { tokenId } = req.body;
  // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  // const ticket = await client.verifyIdToken({
  // 	idToken: tokenId,
  // 	audience: process.env.GOOGLE_CLIENT_ID,
  // });
  const payload = tokenId.getPayload();
  if (payload) {
    const { email_verified, email, name } = payload;
    if (email_verified) {
      const existingEmailUser = await User.findOne({
        email,
      });

      if (existingEmailUser) {
        if (existingEmailUser.accountType === ACCOUNT_TYPE_DEFAULT) {
          return res.status(400).send({
            message: "Your email is registered through password.",
          });
        }
        if (existingEmailUser.accountType !== ACCOUNT_TYPE_GOOGLE) {
          return res.status(400).send({
            message: "This account is not registered via Google Login",
          });
        }
        if (!existingEmailUser.flag) {
          return res.status(400).send({
            message: "Your account has been permanently deleted.",
          });
        }
        // sign Token
        const JWTPayload = {
          id: existingEmailUser._id,
          role: existingEmailUser.role,
        };
        const { _id, email, name, role } = existingEmailUser;
        // sign Token
        jwt.sign(
          JWTPayload,
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.ADMIN_SESSION_EXPIRES_IN, // session active duration
          },
          (err, token) => {
            if (!err) {
              const BearerToken = `Bearer ${token}`;
              return res.json({
                success: true,
                message: "Logged in successfully",
                token: BearerToken,
                user: {
                  _id,
                  email,
                  name,
                  role,
                },
              });
            }
            return res.status(400).json({
              message: "Error on generating token.",
            });
          }
        );
      }
      // register the user here
      let password = email + process.env.JWT_SECRET;
      const modelBody = {
        email,
        name,
        password,
        socialId: tokenId,
      };
      modelBody.accountType = ACCOUNT_TYPE_GOOGLE;
      const modelDoc = new User(modelBody);
      const savedData = await modelDoc.save();
      if (savedData && savedData._id) {
        // sign Token
        const JWTPayload = {
          id: savedData._id,
          role: savedData.role,
        };
        const { _id, email, name, role } = savedData;
        // sign Token
        jwt.sign(
          JWTPayload,
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.ADMIN_SESSION_EXPIRES_IN, // session active duration
          },
          (err, token) => {
            if (!err) {
              const BearerToken = `Bearer ${token}`;
              return res.json({
                success: true,
                message: "User signup failed with google",
                token: BearerToken,
                user: {
                  _id,
                  email,
                  name,
                  role,
                },
              });
            }
            return res.status(400).json({
              message: "Error on generating token.",
            });
          }
        );
      }
      return res.status(400).json({
        message: "Sorry! Not able to save your record!",
      });
    }
    // email not verified, throws an error
    return res.status(400).send({
      message: "We do not accept unverified email! Try with other accounts",
    });
  }
  return 0;
});

router.post("/facebook-login", async (req, res) => {
  const { accessToken, userId } = req.body;
  const fbVerifyURL = `https://graph.facebook.com/v2.11/${userId}/?fields=id,name,email&access_token=${accessToken}`;
  fetch(fbVerifyURL, {
    method: "GET",
  })
    .then((response) => response.json())
    .then(async (payload) => {
      if (payload) {
        const { email, name } = payload;
        if (email) {
          const existingEmailUser = await ClientModel.findOne({
            email,
          });

          if (existingEmailUser) {
            if (existingEmailUser.accountType === ACCOUNT_TYPE_DEFAULT) {
              return res.status(400).send({
                message: "Your email is registered through password.",
              });
            }
            if (existingEmailUser.accountType !== ACCOUNT_TYPE_FACEBOOK) {
              return res.status(400).send({
                message: "This account is not registered via Facebook Login",
              });
            }
            if (existingEmailUser.isDeleted) {
              return res.status(400).send({
                message: "Your account has been permanently deleted.",
              });
            }
            if (!existingEmailUser.activeStatus) {
              return res.status(400).send({
                message: "Your account has been temporarily deactivated.",
              });
            }
            // sign Token
            const token = getClientToken(existingEmailUser);
            if (token) {
              res.json({
                token: `Bearer ${token}`,
                message: "You are login to RSVPHK",
              });
            }
            return res.status(400).json({
              message: "Error on generating token.",
            });
          }
          // register the user here
          const modelBody = {
            email,
            name,
            isVerified: true,
          };
          modelBody.accountType = ACCOUNT_TYPE_FACEBOOK;
          const modelDoc = new ClientModel(modelBody);
          const savedData = await modelDoc.save();
          if (savedData && savedData._id) {
            // sign Token
            const token = getClientToken(savedData);
            if (token) {
              res.json({
                token: `Bearer ${token}`,
                message: "You are registered to RSVPHK",
              });
            }
            return res.status(400).json({
              message: "Error on generating token.",
            });
          }
          return res.status(400).json({
            message: "Sorry! Not able to save your record!",
          });
        }
        // email not verified, throws an error
        return res.status(400).send({
          message: "We do not accept unverified email! Try with other accounts",
        });
      }
      return 0;
    });

  return 0;
});

// reset password
router.post(
  "/change-password",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const users = await User.findById(req.user.id);
      const saltRounds = 10;
      const match = await bcrypt.compare(currentPassword, users.password);
      if (match) {
        let newPass = bcrypt.hashSync(newPassword, saltRounds);

        const newpass = await User.findOneAndUpdate(
          {
            _id: users._id,
          },
          {
            password: newPass,
          }
        );
        if (newpass) {
          // sign Token
          const JWTPayload = {
            id: newpass._id,
            role: newpass.role,
          };
          const { _id, email, name, role, username, avatar } = newpass;
          // sign Token
          jwt.sign(
            JWTPayload,
            JWT_SECRET,
            {
              expiresIn: 36000, // session active duration
            },
            (err, token) => {
              if (!err) {
                const BearerToken = `Bearer ${token}`;
                return res.json({
                  success: true,
                  message: "Your password is changed successfully",
                  token: BearerToken,
                  user: {
                    _id,
                    email,
                    name,
                    role,
                    username,
                    avatar,
                  },
                });
              }
              return res.status(400).json({
                status: false,
                message: "Error on generating token.",
              });
            }
          );
          // res.json({
          // 	success: true,
          // 	message: "Your password is changed successfully",
          // 	data: {
          // 		id: newpass._id,
          // 		name: newpass.name,
          // 		phoneNumber: newpass.phoneNumber,
          // 		username: newpass.username,
          // 	},
          // });
        }
      } else {
        res.json({
          success: false,
          message: "Current password donot match",
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Bad request",
        data: {},
      });
    }
  }
);

router.post(
  "/logout",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    try {
      // let userId = req.user.id;
      // let filter = { _id: userId, flag: true };
      // let update = { activeStatus: false };
      // User.findOneAndUpdate(filter, update, { new: true })
      // 	.then((result) => {
      // 		res.json({
      // 			status: true,
      // 			message: "Logged out successfully",
      // 			data: {},
      // 		});
      // 	})
      // 	.catch((err) => {
      // 		console.log(err);
      // 		res.json({
      // 			status: false,
      // 			message: "Cannot logout",
      // 		});
      // 	});
      req.logout();
      res.json({
        status: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      res.json({
        status: false,
        message: "Bad request",
        data: {},
      });
    }
  }
);

router.post("/reset-password", async (req, res) => {
  console.log(req.body);
  let emailData = req.body.email;
  let newPassword = req.body.password;
  let rePassword = req.body.rePassword;
  const errors = {};
  if (isEmpty(newPassword) || newPassword !== rePassword) {
    errors.message = "Something went wrong.";
    return res.json({
      status: false,
      message: errors.message,
      token: null,
      data: {},
    });
  }

  try {
    const countUser = await User.findOne({
      email: emailData,
      flag: true,
    }).count();
    if (countUser == 0) {
      res.status(400).json({
        message: "We could not find phone number",
      });
    }
    const saltRounds = 10;
    const hashPassword = bcrypt.hashSync(newPassword, saltRounds);
    newPassword = hashPassword;
    let filter = {
      email: emailData,
      flag: true,
    };
    let update = {
      password: newPassword,
    };
    User.findOneAndUpdate(filter, update, {
      new: true,
    })
      .then((result) => {
        res.json({
          status: true,
          message: "Password updated",
          data: {},
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: false,
          message: "Cannot update password",
        });
      });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// @route:  POST api/users/searchartist
// @desc:	artist searching
// @access: public

router.post("/searchartist", async (req, res) => {
  try {
    let query = req.body.query;
    let perPage = parseInt(req.body.limit); // 0 to get all data
    // let page = req.body.page;
    // let skipNumber = 0;
    // if (page) {
    // 	skipNumber = perPage * page - perPage;
    // }
    // console.log(perPage);
    if (isEmpty(query) || isNaN(perPage)) {
      res.json({
        status: false,
        message: "Empty query or limit",
        data: [],
      });
    } else {
      //search for upper or lower cases both
      const artistSearch = await User.find({
        name: {
          $regex: query,
          $options: "i",
        },
      }).limit(perPage);
      // const artistSearch = await User
      // 	.find({
      // 		// $match: {
      // 		name: regex
      // 		// }
      // 	})
      // 	// .skip(skipNumber)
      // 	.limit(perPage);
      let dataArtist = artistSearch.map((each) => ({
        _id: each._id,
        name: each.name,
        username: each.username,
        profilePicture: each.profilePicture,
        activeStatus: each.activeStatus,
        email: each.email,
        address: each.address,
        phoneNumber: each.phoneNumber,
      }));
      res.json({
        status: true,
        message: "Succesfully fetched artist search",
        data: dataArtist,
      });
    }
  } catch (error) {
    res.json({
      message: "Bad request",
      error,
    });
  }
  // 	.then((each) => {
  // 			if (each) {
  // 				// console.log(each);
  // 				res.json({
  // 					status: true,
  // 					message: "Succesfully fetched artist search",
  // 					data: each,
  // 				});
  // 			} else {
  // 				res.json({
  // 					status: false,
  // 					message: "Cannot fetched artist search",
  // 					data: [],
  // 				});
  // 			}
  // })
  // .catch((err) => {
  // 	console.log(err);
  // 	res.json({
  // 		status: false,
  // 		message: "Bad request",
  // 		data: err,
  // 	});
  // });
});

// @route:  POST api/users/forgot-password
// @desc:	OTP mail or phoneNo
// @access: public
router.post("/forgot-password", async (req, res) => {
  try {
    let emailOrPhone = req.body.emailOrPhone;
    const isEmail = validator.isEmail(emailOrPhone);
    // console.log(isEmail);
    let userProfile = await User.findOne(
      isEmail
        ? {
            email: emailOrPhone,
            flag: true,
          }
        : {
            phoneNumber: emailOrPhone,
            flag: true,
          }
    );
    if (!userProfile) {
      res.json({
        status: false,
        message: "No user",
      });
    } else {
      let userEmail = userProfile.email;
      let code = Math.floor(1000 + Math.random() * 9000);
      let bodyData = {};
      bodyData.OtpCode = code;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      var mailOptions = {
        from: "Inksvilla.com <donotreply@inksvilla.com>",
        to: userEmail,
        subject: "Reset Password",
        text: "Your OTP code is: " + code,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // console.log(error);
          return res.json({
            status: false,
            message: "Failed to send mail",
          });
        } else {
          return res.json({
            status: true,
            message: "Successfully sent reset code to your mail",
            data: bodyData,
          });
        }
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: "Bad request",
      data: error,
    });
  }
});

// @route:  POST api/users/userDetail
// @desc:	change user detail
// @access: artist
router.post(
  "/userDetail",
  passport.authenticate("jwt", {
    session: false,
  }),
  async (req, res) => {
    const _id = req.user.id;
    const { username, email } = req.body;
    const userProfile = await User.findById({
      _id,
      flag: true,
    });
    if (!userProfile) {
      return res.json({
        status: false,
        message: "no user",
        data: {},
      });
    }

    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.json({
        status: false,
        message: "Email invalid",
        data: {},
      });
    }
    let usernameData = await User.findOne({
      username: username,
      flag: true,
    });
    if (usernameData) {
      return res.json({
        status: false,
        message: "Username already exists",
        data: {},
      });
    }
    // let emailData = await User.findOne({
    // 	email: email,
    // 	flag: true,
    // });
    // if (emailData) {
    // 	return res.json({
    // 		status: false,
    // 		message: "Email already exists",
    // 		data: {},
    // 	});
    // }
    // let phoneData = await User.findOne({
    // 	phoneNumber: phone,
    // 	flag: true,
    // });
    // if (phoneData) {
    // 	return res.json({
    // 		status: false,
    // 		message: "Phone number already exists",
    // 		data: {},
    // 	});
    // }
    await User.findOneAndUpdate(
      {
        _id,
        flag: true,
      },
      {
        $set: {
          username: username,
          // email: email,
          phoneNumber: phone,
          latitude: latitude,
          longitude: longitude,
          address: address,
        },
      },
      {
        new: true,
      }
    )
      .then((profile) => {
        res.json({
          status: true,
          message: "Successfully updated profile",
          data: {
            // email: profile.email,
            username: profile.username,
            phoneNumber: profile.phoneNumber,
            latitude: profile.latitude,
            longitude: profile.longitude,
            address: profile.address,
            city: profile.city,
            country: profile.country,
          },
        });
      })
      .catch((err) => {
        res.json({
          success: false,
          err,
        });
      });
  }
);

module.exports = router;
