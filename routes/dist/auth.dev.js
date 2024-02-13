"use strict";

var express = require("express");

var authController = require("../controllers/auth");

var router = express.Router();

var User = require("../models/user");

var _require = require("express-validator"),
    check = _require.check,
    body = _require.body;

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post("/login", body("email").isEmail().withMessage("Please enter a valid email address."), body("password", "Password has to be valid.").isLength({
  min: 5
}).isAlphanumeric(), authController.postLogin);
router.post("/signup", check("email").isEmail().withMessage("Please Enter a Valid Email.").normalizeEmail().custom(function _callee(value, _ref) {
  var req, userDoc;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          req = _ref.req;
          _context.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: value
          }));

        case 3:
          userDoc = _context.sent;

          if (!userDoc) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", Promise.reject("E-Mail exists already, please pick a different one."));

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}), body("password", "Please Enter a password with only numbers and text and at least 5 character").isLength({
  min: 5
}).isAlphanumeric(), body("confirmPassword").custom(function (value, _ref2) {
  var req = _ref2.req;

  if (value !== req.body.password) {
    throw new Error("Password have to match!");
  }

  return true;
}), authController.postSignup);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
module.exports = router;