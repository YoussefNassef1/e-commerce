"use strict";

exports.get404 = function (req, res, next) {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: true
  });
};

exports.get500 = function (req, res, next) {
  res.status(404).render("500", {
    pageTitle: "Error Page",
    path: "/500",
    isAuthenticated: true
  });
};