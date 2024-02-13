const fs = require("fs");
const express = require("express");
const app = express();
const https = require("https");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const helmet = require("helmet");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const compression = require("compression");
const morgan = require("morgan");
dotenv.config({ path: "./config.env" });

const MongoDb_Uri = process.env.MONGO;

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

const User = require("./models/user");
const errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log")
);
const store = new MongoDbStore({
  uri: MongoDb_Uri,
  collection: "sessions",
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(404).render("500", {
    pageTitle: "Error Page",
    path: "/500",
    isAuthenticated: true,
  });
});
mongoose
  .connect(MongoDb_Uri)
  .then(() => {
    console.log("DataBase and port already connected");
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
