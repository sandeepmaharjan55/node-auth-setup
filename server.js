// import npm modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
var bodyParser = require("body-parser");

//import local modules

// define global variables
const app = express();
const PORT = process.env.PORT || 7000;

const { MONGODB_URI } = require("./config/key");
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("connected to local"))
  .catch((err) => console.log(err));

app.use((req, res, next) => {
  // console.log("i am here");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
//middlewares
require("./middlewares/middlewares")(app);

//routes
require("./routes/")(app); //all routes

//When you face an error 413 Payload too large in NodeJS, use this to fix that out
// app.use(bodyParser.json({
// 	limit: "50mb"
// }));
// app.use(bodyParser.urlencoded({
// 	extended: true,
// 	limit: "50mb"
// }));
// end payload error

//if client ask for any file or assets
if (true || process.env.NODE_ENV === "production") {
  // Express will serve up production assetes
  // Like our main .js file r main.css file!

  app.use(express.static("client/build"));

  // Express will serve up the index.html file
  // if it doesnot recognize the route
  // const path = require("path");
  app.use("/public", express.static("public"));
  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  // });
  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "projectFrontend", "index.html"));
  // });
}
// app.use("/uploads", express.static("uploads"));
//booted up the server
app.listen(PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Server is up @ ${PORT} port.`);
});
