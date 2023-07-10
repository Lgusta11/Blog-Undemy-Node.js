const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sequelize = require("./database/database");
const session = require("express-session");

const categoriesController = require("./categories/controlerCat");
const articlesController = require("./articles/ac");
const usersController = require("./user/userController");

const Article = require("./articles/article");
const Category = require("./categories/category");
const User = require("./user/User");

app.set("view engine", "ejs");

app.use(
  session({
    secret: "vasco",
    cookie: { maxAge: 30000000 },
  })
);

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);



app.get("/session" , (req,res) =>{
  
})


app.get("/leitura" , (req,res) =>{
  
})

sequelize
  .authenticate()
  .then(() => {
    console.log("database conectado");
  })
  .catch((error) => {
    console.log("error na database");
  });

app.get("/", (req, res) => {
  Article.findAll({
    order: [["id", "DESC"]],
    limit: 4,
  })
    .then((articles) => {
      Category.findAll().then((categories) => {
        res.render("index", { articles: articles, categories: categories });
      });
    })
    .catch((error) => {
      console.log("Erro ao recuperar os artigos:", error);
      res.render("index", { articles: [] });
    });
});

app.get("/:slug", (req, res) => {
  let slug = req.params.slug;
  Article.findOne({
    where: {
      slug: slug,
    },
  })
    .then((article) => {
      if (article) {
        Category.findAll().then((categories) => {
          res.render("article", { article: article, categories: categories });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
  let slug = req.params.slug;
  Category.findOne({
    where: {
      slug: slug,
    },
    include: [{ model: Article }],
  })
    .then((category) => {
      if (category) {
        Category.findAll().then((categories) => {
          res.render("category", {
            articles: category.Articles, // Corrigido: utilize o nome do relacionamento correto
            categories: categories, // Passe as categorias para o template
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.listen(4040, () => {
  console.log("O servidor esta rodando!");
});

module.exports = app;
