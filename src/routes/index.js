const { Router } = require("express");
const router = Router();

const {
  root,
  userRegister,
  userLogin,
  userDashboard,
  userLogOut,
  postUserRegister,
  getUserLogin,
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../controllers/UserLoginController");

router.get("/", root);

router.get("/users/register", checkAuthenticated, userRegister);

router.get("/users/login", checkAuthenticated, userLogin);

router.get("/users/dashboard", checkNotAuthenticated, userDashboard);

router.get("/users/logout", userLogOut);

router.post("/users/register", postUserRegister);

router.post("/users/login", getUserLogin);

module.exports = router;
