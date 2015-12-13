var express = require('express');
var exphs = require('express-handlebars');
var app = express();

app.engine('handlebars', exphs({defaultLayout: 'master'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.use(require('./controllers'));

var ipAddress = require('./helpers/IpFinder')();
app.listen(3000, function () {
  console.log('Listening on port 3000...');
  console.log('Local Network IP: ' + ipAddress);
});
