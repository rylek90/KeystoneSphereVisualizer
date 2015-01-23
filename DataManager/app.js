var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/javascripts')));
app.engine('.html', require('ejs').renderFile);
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/manage', function(req, res) {

    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');

    var filePath = path.join(__dirname, '/public/keystone.xml');
    var scientist;

    fs.readFile(filePath, {}, function(err, data) {
        if (!err) {
            res.render('manageView', {data: data});
        }
    });

});


module.exports = app;
