module.exports = app => {
  const product = require("../controllers/product.controller.js");

  var router = require("express").Router();

  // Retrieve most viewed product
  router.get("/mostViewed", product.mostViewed);
  // Retrieve a single Product with id
  router.get("/:id/:currency", product.findOne);

  app.use('/api/product', router);
};
