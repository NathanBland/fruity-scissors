var express = require('express')
var mongoose = require('mongoose')
var nunjucks = require('nunjucks')
var bodyParser = require('body-parser')
//var spawn = require('child_process').spawn;
var http = require('http')
//var config = require('./config')
var config = {PORT: 8080, IP: '0.0.0.0'}

var app = require('express')()
var io = require('socket.io')()
app.io = io
var routes = require('./routes/')

app.set('dbhost', process.env.IP || 'localhost')
app.set('dbname', 'fruity')
mongoose.connect('mongodb://' + app.get('dbhost') + '/' + app.get('dbname'))

//use nunjucks because awesome.
app.set('view engine', 'html')
app.set('views', __dirname + '/views')
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  watch: true
})

// basic app config.
app.set('port', config.PORT || 1337)
app.set('ip', config.IP || '0.0.0.0')

//static folder for things like css
app.use(express.static('public'))

//make user input safe
app.use(bodyParser.json({
  type: '*/json'
}))
app.use(bodyParser.urlencoded({ //parse submitted data using bodyParser
  extended: false
}))

//routes
app.use(routes.setup(app))

//start the server up.
var server = http.createServer(app).listen(config.PORT);

io.attach(server);
