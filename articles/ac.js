const express = require("express");
const router = express.Router();
const Category = require("../categories/category");
const Article = require("./article");
const slugify = require("slugify");
const app = require("../index");
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/articles",adminAuth, (req, res) => {
  Article.findAll({
    include: [
      {
        model: Category,
      },
    ],
  }).then((articles) => {
    res.render("admin/articles/index", { articles: articles });
  });
});

router.get("/admin/articles/new",adminAuth, (req, res) => {
  Category.findAll()
    .then((categories) => {
      res.render("admin/articles/new", { categories: categories });
    })
    .catch(() => {
      res.redirect("/admin/categories");
    });
});

router.post("/articles/save",adminAuth, (req, res) => {
  let title = req.body.title;
  let body = req.body.body;
  let category = req.body.category;

  let slug = slugify(title.toLowerCase());
  Article.create({
    title: title,
    slug: slug,
    body: body,
    categoryId: category,
  }).then(() => {
    res.redirect("/admin/articles");
  });
});

router.post("/articles/delete",adminAuth, (req, res) => {
  let id = req.body.id;
  if (id) {
    if (!isNaN(id)) {
      Article.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect("/admin/articles");
      });
    } else {
      res.redirect("/admin/articles"); // id não é um número
    }
  } else {
    res.redirect("/admin/articles"); // id é nulo
  }
});

router.get("/admin/articles/edit/:id",adminAuth, (req, res) => {
  const articleId = req.params.id;

  Article.findByPk(articleId)
    .then((article) => {
      if (article) {
        Category.findAll()
          .then((categories) => {
            res.render("admin/articles/edit", {
              article: article,
              categories: categories,
            });
          })
          .catch((error) => {
            console.log("Erro ao recuperar as categorias:", error);
            res.redirect("/admin/articles");
          });
      } else {
        res.redirect("/admin/articles");
      }
    })
    .catch((error) => {
      console.log("Erro ao recuperar o artigo:", error);
      res.redirect("/admin/articles");
    });
});

router.get("/articles/page/:num", (req, res) => {
  let page = req.params.num;
  let limit = 4;
  let offset = 0;

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  offset = (page - 1) * limit;

  Article.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [["id", "DESC"]],
    include: [
      {
        model: Category,
      },
    ],
  })
    .then((articles) => {
      // Remove as tags <p> do corpo dos artigos
      articles.rows.forEach((article) => {
        article.body = article.body.replace(/<p>/g, "").replace(/<\/p>/g, "");
      });

      let next = offset + limit < articles.count;

      const result = {
        page: parseInt(page),
        next: next,
        articles: articles.rows.map((articleData) => {
          return {
            id: articleData.id,
            title: articleData.title,
            slug: articleData.slug,
            body: articleData.body,
            createdAt: articleData.createdAt,
            updatedAt: articleData.updatedAt,
            categoryId: articleData.categoryId,
            category: articleData.category ? articleData.category.title : "",
          };
        }),
      };

      Category.findAll().then((categories) => {
        res.render("admin/articles/page", { result: result, categories: categories });
      });
    })
    .catch((error) => {
      console.log("Erro ao recuperar os artigos:", error);
      res.status(500).json({ error: "Erro ao recuperar os artigos" });
    });
});



module.exports = router;
