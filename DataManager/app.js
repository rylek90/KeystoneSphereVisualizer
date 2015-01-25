var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/javascripts')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/manage/:id', function(req, res) {

    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');

    var filePath = path.join(__dirname, '/public/keystone.xml');

    fs.readFile(filePath, {}, function(err, data) {
        if (!err) {
            xml.parseString(data, function (err, parsedXml) {
                if (!err) {
                    var person = getPerson(parsedXml, req.param('id'));
                    console.dir(person.workgroups[0].workgroup[0]);
                    var workgroups = getAssociatedWorkgroups(parsedXml, person.workgroups);

                    var country = getAssociatedCountry(parsedXml, person.country);
                    //var workgroups = getAssociatedWorkgroups(parsedXml, person)
                    res.render('manageView', { "person": person.$, "country": country });
                    
                }
            });
        }
    });

});

Array.prototype.contains = function (obj) {
    var index = this.indexOf(obj);
    return (index >= 0);
};

function getAssociatedWorkgroups(parsedXml, workGroupsIds) {
    var workgroupsResult = [];
    var workgroups = parsedXml.root.workgroups[0].workgroup;
    
    for (var i = 0; i < workgroups.length; i++) {
        var selected = false;
        if (workGroupsIds.contains(workgroups[i].$.id)) {
            selected = true;
        }
        console.dir(workgroups[i]);
        workgroupsResult[i] = { name: workgroups[i]._, id: workgroups[i].$.id, isSelected: selected };
    }
    return workgroupsResult;
}

function getAssociatedCountry(parsedXml, countryId) {
    var countries = parsedXml.root.countries[0].country;
    
    var resultCountries = [];

    for (var i = 0; i < countries.length; i++) {
        var selected = false;
        if (countries[i].$.id == countryId) {
            selected = true;
        }
        resultCountries[i] = { id: countries[i].$.id, name: countries[i]._, isSelected: selected }        ;
    }

    return resultCountries;
}

function getPerson(parsedXml, id) {
    var people = parsedXml.root.people[0].person;
    for (var i = 0; i < people.length; i++) {
        if (people[i].$.id == id) {
            console.dir(people[i]);
            return people[i];
        }
    }
}

module.exports = app;
