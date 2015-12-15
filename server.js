var express = require('express');
var exphs = require('express-handlebars');
var bodyParser = require('body-parser');
var hbs = exphs.create({
  helpers: require('./helpers/handlebars/IfConditionals'),
  defaultLayout: 'master'
});
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
exports.io = io;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
exports.app = app;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));

var ipAddress = require('./helpers/IpFinder')();
server.listen(3000, function () {
  console.log('Listening on port 3000...');
  console.log('Local Network IP: ' + ipAddress);
});
