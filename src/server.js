const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");

const initializePassport = require("./config/passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(require("./routes/index"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
