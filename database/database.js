const Sequelize = require("sequelize");

const sequelize = new Sequelize("blog", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "-03:00"
});


module.exports = sequelize

