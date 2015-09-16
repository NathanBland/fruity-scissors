var mongoose = require('mongoose')

var Card = mongoose.Schema({
  name: String,
  img: String,
  beats: [String]
});

module.exports = mongoose.model('card', Card)
