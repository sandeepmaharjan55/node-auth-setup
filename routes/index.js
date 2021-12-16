const user = require("./api/users");
// const imageUpload = require("./imageUpload");
const seed = require("./seed");

module.exports = (app) => {
  app.use("/seed", seed);
  app.use("/api/users", user);

};
