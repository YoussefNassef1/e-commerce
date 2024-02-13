"use strict";

var crypto = require("crypto");

var bcrypt = require("bcryptjs");

var sgMail = require("@sendgrid/mail");

var _require = require("express-validator"),
    validationResult = _require.validationResult;

var User = require("../models/user");

var user = require("../models/user");

sgMail.setApiKey("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");

exports.getLogin = function (req, res, next) {
  var message = req.flash("error");

  if (message.length > 0) {
    message = message;
  } else {
    message = null;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    oldInput: {
      email: ""
    },
    validationError: []
  });
};

exports.getSignup = function (req, res, next) {
  var message = req.flash("error");

  if (message.length > 0) {
    message = message;
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: "",
      password: ""
    },
    validationError: []
  });
};

exports.postLogin = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var errors = validationResult(req);
  console.log(errors.array());

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email
      },
      validationError: errors.array()
    });
  }

  User.findOne({
    email: email
  }).then(function (user) {
    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: "Invalid email or password.",
        oldInput: {
          email: email
        },
        validationError: errors.array()
      });
    }

    bcrypt.compare(password, user.password).then(function (doMatch) {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(function (err) {
          console.log(err);
          res.redirect("/");
        });
      }

      res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email or password.",
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    })["catch"](function (err) {
      console.log(err);
      res.redirect("/login");
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postSignup = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "SignUp",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationError: errors.array()
    });
  }

  bcrypt.hash(password, 12).then(function (hashedPassword) {
    var user = new User({
      email: email,
      password: hashedPassword,
      cart: {
        items: []
      }
    });
    user.save();
  }).then(function () {
    res.redirect("/login");
    return sgMail.send({
      to: email,
      from: "ynassef1@gmail.com",
      subject: "Signup succeeded!",
      html: "<h1>You successfully signed up!</h1>"
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postLogout = function (req, res, next) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.getReset = function (req, res, next) {
  var message = req.flash("error");

  if (message.length > 0) {
    message = message;
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message
  });
};

exports.postReset = function (req, res, next) {
  crypto.randomBytes(32, function (err, buffer) {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    var token = buffer.toString("hex");
    user.findOne({
      email: req.body.email
    }).then(function (user) {
      if (!user) {
        req.flash("error", "No Account with that email Found.");
        return res.redirect("/reset");
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(function (result) {
      res.redirect("/");
      sgMail.send({
        to: req.body.email,
        from: "ynassef1@gmail.com",
        subject: "Password reset",
        html: "\n            <p>You requested a password reset</p>\n            <p>Click this <a href=\"http://localhost:3000/reset/".concat(token, "\">link</a> to set a new password.</p>\n          ")
      });
    })["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  });
};

exports.getNewPassword = function (req, res, next) {
  var token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  }).then(function (user) {
    var message = req.flash("error");

    if (message.length > 0) {
      message = message;
    } else {
      message = null;
    }

    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postNewPassword = function (req, res, next) {
  var userId = req.body.userId;
  var newPassword = req.body.password;
  var passwordToken = req.body.passwordToken;
  var resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now()
    },
    _id: userId
  }).then(function (user) {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  }).then(function (hashedPassword) {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  }).then(function (result) {
    res.redirect("/login");
    sgMail.send({
      to: resetUser.email,
      from: "ynassef1@gmail.com",
      subject: "Password Change Sucuss",
      html: "<h2>Password Change Sucuss</h2>"
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};