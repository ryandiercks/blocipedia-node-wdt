const express = require("express");
const router = express.Router();
const validation = require("./validation");

const userController = require("../controllers/userController")

router.get("/users/signup", userController.signUp);
router.post("/users/signup", validation.validateUsers, userController.create);
router.get("/users/signIn", userController.signInForm);
router.post("/users/signIn", userController.signIn);
router.get("/users/signOut", userController.signOut);
router.get("/users/:id", userController.show);
router.get("/users/:id/upgradeForm", userController.upgradeForm);
router.post("/users/:id/upgrade", userController.payment);
router.get("/users/:id/downgradeForm", userController.downgradeForm);
router.post("/users/:id/downgrade", userController.downgrade);

module.exports = router;
