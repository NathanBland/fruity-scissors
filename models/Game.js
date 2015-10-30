var mongoose = require('mongoose')
var User = require('./User')
var Card = require('./Card')

var Game = mongoose.Schema({
  owner: String,
  player_1: {card :{ type: String }},
  player_2: {card :{ type: String }},
  final: Boolean,
  previous: String,
  draw: Boolean,
  winner: {
    user: String,
    card: String
    /*user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'card'
    }*/
  },
  loser: {
    user: String,
    card: String
  }
});

module.exports = mongoose.model('game', Game)
