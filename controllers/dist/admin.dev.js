"use strict";

var Product = require("../models/product");

var _require = require("express-validator"),
  validationResult = _require.validationResult;

var fileHelper = require("../util/file");

var ITEM_PER_PAGE = 3;

exports.getAddProduct = function (req, res, next) {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: null,
    validError: [],
  });
};

exports.postAddProduct = function (req, res, next) {
  var title = req.body.title;
  var image = req.file;
  var price = req.body.price;
  var description = req.body.description;
  var errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validError: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validError: errors.array(),
    });
  }

  var imageUrl = image.path;
  var product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(function (result) {
      res.redirect("/admin/products");
    })
    ["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = function (req, res, next) {
  var editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  var prodId = req.params.productId;
  Product.findById(prodId)
    .then(function (product) {
      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        hasError: false,
        errorMessage: null,
        validError: [],
      });
    })
    ["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = function (req, res, next) {
  var prodId = req.body.productId;
  var updatedTitle = req.body.title;
  var updatedPrice = req.body.price;
  var image = req.file;
  var updatedDesc = req.body.description;
  var errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: "Attached file is not an image.",
      validError: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validError: errors.array(),
    });
  }

  Product.findById(prodId)
    .then(function (product) {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;

      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product.save();
    })
    .then(function (result) {
      res.redirect("/admin/products");
    })
    ["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = function (req, res, next) {
  page = +req.query.page || 1;
  var totalItems;
  Product.find({
    userId: req.user._id,
  })
    .countDocuments()
    .then(function (numProducts) {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then(function (products) {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
      });
    })
    ["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = function (req, res, next) {
  var prodId = req.params.productId;
  Product.findById(prodId)
    .then(function (product) {
      if (!product) {
        return next(new Error("product not found"));
      }

      fileHelper.deleteFile(product.imageUrl);
      return Product.findByIdAndDelete(prodId);
    })
    .then(function () {
      res.status(200).json({
        massage: "Success",
      });
    })
    ["catch"](function (err) {
      res.status(500).json({
        massage: "Deleting Product failed",
      });
    });
};
