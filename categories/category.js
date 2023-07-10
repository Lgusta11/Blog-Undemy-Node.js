const Sequelize = require("sequelize")
const sequelize = require("../database/database")

const Category = sequelize.define('categories', {
    title:{
        type: Sequelize.STRING,
        allowNull:false
    },slug:{
        type: Sequelize.STRING,
        allowNull:false
    }
})

//Category.sync({force: true})

module.exports = Category