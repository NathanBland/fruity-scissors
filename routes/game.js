var express = require("express")
var Game = require('../models/Game')

exports.setup = function(app, io) {
  var router = express.Router();
  var hasSocket = false

  function getWins(card) {
    /**
     * This will eventually be a database call
     * once the admin backend and auth are setup
     * to store this kind of thing effectively.
     * Until then, this will be a glorious,
     * hard-coded, mess.
     */
    var wins = []
    if (card === 'Kiwi') {
      wins = ['w', 'p', 'a']
    }
    else if (card === 'Pineapple') {
      wins = ['g', 'w', 'a']
    }
    else if (card === 'Banana') {
      wins = ['p', 'g', 'k']
    }
    else if (card === 'Watermelon') {
      wins = ['a', 't', 'b']
    }
    else if (card === 'Apple') {
      wins = ['g', 'b', 't']
    }
    else if (card === 'Grapes') {
      wins = ['t', 'w', 'k']
    }
    else if (card === 'Tomato') {
      wins = ['p', 'b', 'k']
    }
    else {
      console.log('No valid Card selected?')
      console.log('card:', card)
    }
    return wins
  }

  function determineWinner(owner, game) {
    //determine the cards.
    var card1 = {
      card: game.player_1.card
    }
    var card2 = {
      card: game.player_2.card
    }

    //get list of wins/loss for each cad.
    card1.wins = getWins(card1.card)
    card2.wins = getWins(card2.card)
    console.log('determining winner..')
    console.log('card1:', card1)
    console.log('card2:', card2)
    if (card1.wins.indexOf(card2.card.toLowerCase().charAt(0)) > -1) {
      console.log('card 1 wins!')
      game.final = true
      game.winner = game.player_1
      game.loser = game.player_2

    }
    else if (card2.wins.indexOf(card1.card.toLowerCase().charAt(0)) > -1) {
      console.log('card 2 wins!')
      game.final = true
      game.winner = game.player_2
      game.loser = game.player_1

    }
    else {
      console.log('draw?')
      console.log('card1 idx check:', card1.wins.indexOf(card2.card.toLowerCase().charAt(0)))
      console.log('card2 idx check:', card2.wins.indexOf(card1.card.toLowerCase().charAt(0)))
      game.final = true
      game.draw = true

    }
    game.save(function(err) {
      if (err) {
        console.warn('err!', err)
        return err
      }
      else {
        console.log('saved game:', game)
        io.in(owner).emit('game_over', game)
      }
    })
  }
  router.route('/:id')
  /**
   * TODO: rewrite this whole thing.
   * 
   */
    .get(function(req, res, next) {
      console.log('params:',req.params)
      var owner = req.params.id
      console.log('user detected, attempting to setup socket workspace..')
      if (!hasSocket) {
        hasSocket = true
        io.on('connection', function(socket) {
          //socket.join(owner)
          socket.on('join', function(room) {
            console.log('Join room:', room)
            console.log('/ index:', room.indexOf('/'))
            if (room.indexOf('/') > -1) {
              var tojoin = room.split('/')[2]
            } else {
              var tojoin = room 
            }
            Game.findOne({
              '_id': tojoin
            }, function(err, game) {
              if (err) {
                console.log("error!", err)
              }
              console.log('room:', room)
              
              console.log('room:', tojoin)
              console.log('game:', game)
              
              socket.join(tojoin)
              owner = tojoin
              var room = io.sockets.adapter.rooms[owner]
              io.to(owner).emit('room', {
                status: 'joined',
                room: game.owner,
                user_count: Object.keys(room).length
              })
              socket.on('invite', function(data) {
                console.log('invite data:', data)
                socket.broadcast.to(owner).emit('invite', data)
              }) 
              socket.on('name_set', function(data) {
                console.log('name_set', data)
                socket.broadcast.to(owner).emit('name_set', data);
              })
              socket.on('play', function(data) {
                console.log('play', data)
                console.log('player:', data.player)
                if (data.player < 3) {
                  var obj = {}
                  obj['player_' + data.player + '.card'] = data.card
                  game.set(obj)
                  
                  //console.log('game:', game)
                    game.save(function(err) {
                      if (err) {
                        socket.broadcast.to(owner).emit('error', {
                          description: "Server error",
                          error: err
                        })
                      }
                      else {
                        Game.findOne({
                          '_id': owner
                        }, function(err, game) {
                          if (err) {
                            console.log("error!", err)
                          }
                          console.log('card states:')
                          console.log('game.player_1', game.player_1)
                          console.log('game.player_2', game.player_2)
                          if (!game.player_1.card || !game.player_2.card) {
                            
                            socket.broadcast.to(owner).emit('card_set', {
                              'player': {
                                player: data.player,
                                ready: true
                              }
                            })
                          }
                          else if (!game.final) {
                            determineWinner(owner, game)
                          }
                        })
                      }
                    })
                }
              })
            })
          })
          console.log('user: connected')
          socket.on('disconnect', function() {
            console.log('user disconnected')
          })
        })
      }
      Game.findOne({
        '_id': owner
      }, function(err, game) {
        if (err) {
          console.log("error!", err)
        }
        return res.render('game', {
          title: "VS!",
          game: game,
          previous: game.previous || ''
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
      /*io.on('connection', function(socket) {
        console.log('user: '+req.body.name+' connected')
      }
      io.on('connection', function(socket) {
        console.log('user connected')
        socket.on('disconnect', function() {
          console.log('user disconnected');
        }
      }*/
      var game = new Game()
      game.set({
        owner: req.body.name,
        final: false,
        previous: req.body.previous || ''
      })
      console.log('New game:', game)
      game.save(function(err) {
        if (err) {
          return res.status(500).json({
            description: "Server error"
          })
        } else {
          return res.redirect('/game/' + game._id)
        }
      })
    })

  return router;
}
