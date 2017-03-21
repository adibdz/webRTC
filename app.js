var express = require('express'),
    path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var sessionStore = require('express-mysql-session');
var passport = require('passport'),
    conn = require('./config/database.js'),
    dbConfig = require('./config/dbConfig');

conn.connect(function(err) {
    if(err) {
        console.log('APP: ' + err);
        return;
    }
    console.log('APP: MySql connected');
});
require('./config/passport')(passport, conn); // pass passport for middleware?

var admins = require('./routes/admin');
var dosens = require('./routes/dosen');
var users = require('./routes/user');
var adminAjaxs = require('./routes/adminAjax');
var dosenAjaxs = require('./routes/dosenAjax');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 80);

app.use(favicon());
app.use(logger('dev'));
// app.use(bodyParser.multipart()); // multipart on bodyParser is deprecated now
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded()); 
// app.use(bodyParser.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded
app.use(cookieParser('4ppl3k3y'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    store: new sessionStore(dbConfig.option), 
    key:'sid',
    secret: '4ppl3k3y',
    saveUninitialized: true,
    resave: true,
    cookie: { 
        maxAge: 3 * 60 * 60 * 1000
    } // 1 minute = 60000 milisecond | 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());

app.locals.pretty = true;

app.use('/', users); /*just middleware :) */
app.use('/admin', admins);
app.use('/admin/ajax', adminAjaxs);
app.use('/dosen', dosens);
app.use('/dosen/ajax', dosenAjaxs);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 404);
        res.render('admin/errors/error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 404);
    res.render('admin/errors/error', {
        message: '',
        error: {},
        title: '500 Server Error'
    });
});

global.__public = __dirname + '/public';
console.log('__public: ' + __public);

//console.log(app._router.stack); /*see middleware stack :) */
module.exports = app;