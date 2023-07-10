const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middlewares/adminAuth")



router.get("/admin/users",adminAuth, (req, res) => {

    User.findAll().then((users) => {
    res.render("admin/users/index", { users: users });
  });
});

router.get("/admin/users/create",adminAuth, (req, res) => {
  res.render("admin/users/create");
});

router.post("/users/create",adminAuth, (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        // Usuário já existe
        res.redirect("/admin/users/create");
      } else {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);

        User.create({
          email: email,
          password: hash,
        })
          .then(() => {
            res.redirect("/admin/users");
          })
          .catch((err) => {
            res.render("error", { message: "Erro ao criar usuário." });
          });
      }
    })
    .catch((err) => {
      res.render("error", { message: "Erro ao verificar usuário." });
    });
});

router.post("/users/delete",adminAuth, (req, res) => {
  let id = req.body.id;
  if (id) {
    if (!isNaN(id)) {
      User.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        res.redirect("/admin/users");
      });
    } else {
      res.redirect("/admin/users"); // id não é um número
    }
  } else {
    res.redirect("/admin/users"); // id é nulo
  }
});

router.get("/admin/users/edit/:id",adminAuth, (req, res) => {
  let id = req.params.id;
  if (!isNaN(id)) {
    User.findByPk(id)
      .then((user) => {
        if (user) {
          res.render("admin/users/edit", { user: user });
        } else {
          res.redirect("/admin/users");
        }
      })
      .catch((error) => {
        res.redirect("/admin/users");
      });
  } else {
    res.redirect("/admin/users");
  }
});

router.post("/users/update",adminAuth, (req, res) => {
  let id = req.body.id;
  let email = req.body.email;
  let password = req.body.password;
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);

  User.update(
    {
      email: email,
      password: hash,
    },
    {
      where: {
        id: id,
      },
    }
  ).then(() => {
    res.redirect("/admin/users");
  });
});

router.get("/login", (req, res) => {
  res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user) {
      let correct = bcrypt.compareSync(password, user.password);

      if (correct) {
        req.session.user = {
          id: user.id,
          email: user.email,
        };
        res.redirect("/admin/articles");
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req,res) => {
  req.session.user = undefined
  res.redirect("/")
})

module.exports = router;
