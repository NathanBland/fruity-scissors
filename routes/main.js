var express = require("express");
exports.setup = function() {
  var router = express.Router();
  router.get('/', function(req, res, next) {
    res.render('index', {
      title: "Fruity Scissors"
    })
  })
  return router;
}
