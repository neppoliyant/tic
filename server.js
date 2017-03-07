require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var path = require('path');
var http = require('https');
var fs = require('fs');

const options = {
  key: fs.readFileSync('./keys/www.thegeekstuff.com.key'),
  cert: fs.readFileSync('./keys/www.thegeekstuff.com.crt'),
  passphrase: 'star'
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/journal', require('./controllers/api/journal.controller'));
app.use('/api/properties', require('./controllers/api/properties.controller'));
app.use('/home', require('./controllers/home.controller'));

app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

// start server
var server = http.createServer(options, app);



server.listen(3000, function () {
    console.log('Server listening at https://' + server.address().address + ':' + server.address().port);
});
