const express = require("express");
const router = express.Router();
const Category = require("./category");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth")
const Article = require("../articles/article");


router.get("/categories",adminAuth, (req, res) => {
  res.send("ROTA DE category!");
});

router.get("/admin/categories/new",adminAuth, (req, res) => {
  res.render("admin/categories/new");
});
router.post("/categories/save",adminAuth, (req, res) => {
  let title = req.body.title;
  if (title) {
    let slug = slugify(title.toLowerCase()); // Corrigido: chame slugify(title.toLowerCase())
    Category.create({
      title: title,
      slug: slug, // Corrigido: atribua o slug gerado à propriedade slug
    }).then(() => {
      res.redirect("/admin/categories");
    });
  } else {
    res.redirect("/admin/categories/new");
  }
});

router.get("/admin/categories",adminAuth, (req, res) => {
  Category.findAll().then((categories) => {
    res.render("admin/categories/index", { categories: categories });
  });
});

router.post("/categories/delete",adminAuth, (req, res) => {
  let id = req.body.id;
  if (id) {
    if (!isNaN(id)) {
      Category.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect("/admin/categories");
      });
    } else {
      res.redirect("/admin/categories"); // id n for number
    }
  } else {
    res.redirect("/admin/categories"); // id nulo
  }
});
router.get("/admin/categories/edit/:id",adminAuth, (req, res) => {
  let id = req.params.id;
  if (!isNaN(id)) {
    Category.findByPk(id)
      .then((category) => {
        if (category) {
          res.render("admin/categories/edit", { category: category });
        } else {
          res.redirect("/admin/categories");
        }
      })
      .catch((error) => {
        res.redirect("/admin/categories");
      });
  } else {
    res.redirect("/admin/categories");
  }
});

router.post("/categories/update",adminAuth, (req, res) => {
  let id = req.body.id;
  let title = req.body.title;
  let slug = slugify(title.toLowerCase());

  Category.update(
    {
      title: title,
      slug: slug,
    },
    {
      where: {
        id: id,
      },
    }
  ).then(() => {
    res.redirect("/admin/categories");
  });
});

router.get("/category/:slug", (req, res) => {
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
            category: category, // Passa a categoria para o template
            articles: category.Articles, // Passa o array de artigos com o nome correto
            categories: categories,
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


module.exports = router;
