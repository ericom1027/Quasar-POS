const express = require("express");
const controllerUser = require("../controllers/user");

const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/login", controllerUser.login);

router.post("/register", controllerUser.registerUser);

router.get("/users", controllerUser.getAllUsers);

router.put("/update/:id", controllerUser.updateUser);

// router.delete(
//   "/delete/:id",
//   auth.verify,
//   auth.verifyAdmin,
//   controllerUser.deleteUser
// );

router.post("/refresh", controllerUser.refreshToken);

// router.post("/logout", controllerUser.logout);

module.exports = router;
