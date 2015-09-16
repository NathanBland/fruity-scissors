var mongoose = require('mongoose')
var User = require('./User')
var Card = require('./Card')

var Game = mongoose.Schema({
  owner: String,
  winner: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'card'
    }
  },
  loser: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'card'
    }
  }
});

module.exports = mongoose.model('game', Game)
