"use strict";

var path = require("path");

var express = require("express");

var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var session = require("express-session");

var MongoDbStore = require("connect-mongodb-session")(session);

var MongoDb_Uri = "mongodb+srv://YoussefNassef:Youssef2345@cluster0.duccz.mongodb.net/ShopMongoose";

var csrf = require("csurf");

var flash = require("connect-flash");

var multer = require("multer");

var app = express();
var csrfProtection = csrf();
var fileStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "images");
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var User = require("./models/user");

var errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.set("views", "views");

var adminRoutes = require("./routes/admin");

var shopRoutes = require("./routes/shop");

var authRoutes = require("./routes/auth");

var store = new MongoDbStore({
  uri: MongoDb_Uri,
  collection: "sessions"
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express["static"](path.join(__dirname, "public")));
app.use('/images', express["static"](path.join(__dirname, "images")));
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single("image"));
app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(csrfProtection);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(function (req, res, next) {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id).then(function (user) {
    if (!user) {
      return next();
    }

    req.user = user;
    next();
  })["catch"](function (err) {
    next(new Error(err));
  });
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use(function (error, req, res, next) {
  res.status(404).render("500", {
    pageTitle: "Error Page",
    path: "/500",
    isAuthenticated: true
  });
});
mongoose.connect(MongoDb_Uri).then(function () {
  app.listen(3000);
})["catch"](function (err) {
  console.log(err);
});