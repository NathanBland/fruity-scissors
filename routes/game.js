var express = require("express")
var Game = require('../models/Game')

exports.setup = function(app, io) {
  var router = express.Router();
  router.route('/owner/:name')
    .get(function(req, res, next) {
      Game.findOne({
        'owner': req.params.name
      }, function(err, game) {
        if (err){
          console.log("error!", err)
        }
        users = 0
        var nsp = io.of('/game/owner'+game.owner)
        nsp.on('connection', function(socket) {
          users += 1
          console.log('user:'+users+' connected')
          if (users > 2){
            console.warn('too many players! Let the others watch?')
          }
          socket.on('disconnect', function() {
            users -= 1
            console.log('user disconnected')
          })
        })
        return res.render('game', {
          title: "VS!",
          game: game
        })
      })
    })
  router.route('/')
    .get(function(req, res, next) {
      return res.render('game', {
        title: "No one home :("
      })
    })
    .post(function(req, res, next) {
      console.log(io)
      /*io.on('connection', function(socket) {
        console.log('user: '+req.body.name+' connected')
      }
      io.on('connection', function(socket) {
        console.log('user connected')
        socket.on('disconnect', function() {
          console.log('user disconnected');
        }
      }*/
      game = new Game()
      game.set({
        owner: req.body.name
      })
      game.save(function(err) {
        if (err) {
          return res.status(500).json({
            description: "Server error"
          })
        } else {
          return res.redirect('/game/owner/' + game.owner)
        }
      })
    })

  return router;
}
