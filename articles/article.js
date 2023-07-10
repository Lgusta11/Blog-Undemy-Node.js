const Sequelize = require("sequelize")
const sequelize = require("../database/database")
const Category = require("../categories/category")


const Article = sequelize.define('artigos', {
    title:{
        type: Sequelize.STRING,
        allowNull:false
    },slug:{
        type: Sequelize.STRING,
        allowNull:false
    }, body:{
        type: Sequelize.TEXT,
        allowNull:false
    }
})

Category.hasMany(Article)
Article.belongsTo(Category)

//Article.sync({force: true})

module.exports = Article