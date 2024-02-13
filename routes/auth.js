const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const User = require("../models/user");
const { check, body } = require("express-validator");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("password", "Password has to be valid.")
    .isLength({ min: 5 })
    .isAlphanumeric(),
  authController.postLogin
);
router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please Enter a Valid Email.")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: value });
      if (userDoc) {
        return Promise.reject(
          "E-Mail exists already, please pick a different one."
        );
      }
    }),
  body(
    "password",
    "Please Enter a password with only numbers and text and at least 5 character"
  )
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password have to match!");
      }
      return true;
    }),
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
