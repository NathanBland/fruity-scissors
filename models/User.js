var mongoose = require('mongoose')

var Game = require('./Game')

var User = mongoose.Schema({
  username: String,
  games: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'game'
    }
  }]
});

module.exports = mongoose.model('user', User)
