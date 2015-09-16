var express = require('express')
exports.setup = function(app) {
  var router = express.Router()
  //var api = require('./api')
  var game = require('./game')
  var main = require('./main')
  //router.use(api.setup(app, io))
  router.use('/game',game.setup(app, app.io))
  router.use('/',main.setup(app))
  return router
}
