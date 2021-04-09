const { Router } = require("express");
const router = Router();
const { pool } = require("../database/dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register");
});

router.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login");
});

router.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user.name });
});

router.get("/users/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have logged out");
  res.redirect("/users/login");
});

router.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;
  console.log({
    name,
    email,
    password,
    password2,
  });

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password shoul be at least 6 characters" });
  }

  if (password != password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    // Form validation has passed

    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered" });
          res.render("register", { errors });
        } else {
          pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password",
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now Registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

router.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

module.exports = router;
