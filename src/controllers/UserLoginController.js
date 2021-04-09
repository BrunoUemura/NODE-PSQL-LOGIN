const { pool } = require("../database/dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");

const root = (req, res) => {
  res.render("index");
};

const userRegister = (req, res) => {
  res.render("register");
};

const userLogin = (req, res) => {
  res.render("login");
};

const userDashboard = (req, res) => {
  res.render("dashboard", { user: req.user.name });
};

const userLogOut = (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have logged out");
  res.redirect("/users/login");
};

const getUserLogin = passport.authenticate("local", {
  successRedirect: "/users/dashboard",
  failureRedirect: "/users/login",
  failureFlash: true,
});

const postUserRegister = async (req, res) => {
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
};

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

module.exports = {
  root,
  userRegister,
  userLogin,
  userDashboard,
  userLogOut,
  postUserRegister,
  getUserLogin,
  checkAuthenticated,
  checkNotAuthenticated,
};
