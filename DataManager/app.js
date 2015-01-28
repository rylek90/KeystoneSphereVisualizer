var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var peopleGuid = "9ef63c93-a666-11e4-8d3d-002219ef6eb5";

var app = express();
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/public/javascripts/lib/bootstrap.min.js', function(req, res) {
    res.sendfile(__dirname + '/public/javascripts/lib/bootstrap.min.js');
});

app.get('/public/javascripts/lib/bootstrap-multiselect.js', function (req, res) {
    res.sendfile(__dirname + '/public/javascripts/lib/bootstrap-multiselect.js');
});

app.get('/public/stylesheets/bootstrap.min.css', function (req, res) {
    res.sendfile(__dirname + '/public/stylesheets/bootstrap.min.css');
});

app.get('/public/stylesheets/bootstrap-multiselect.css', function (req, res) {
    res.sendfile(__dirname + '/public/stylesheets/bootstrap-multiselect.css');
});

app.get('/public/javascripts/manager/ScientistManager.js', function (req, res) {
    res.sendfile(__dirname + '/public/javascripts/manager/ScientistManager.js');
});

app.post('/postData', function(req, res) {
    var data = req.body;
    

    var guids = [data.country, data.workgroup, data.entity];

    if (data['expertises[]']) {
        for (var i = 0; i < data['expertises[]'].length; i++) {
            guids[guids.length] = data['expertises[]'][i];
        }
    }

    appendToXml(function (serializedPath) {
        res.send(serializedPath);
    }, data.url, data.name, data.imgSrc, guids);

    
});

app.get('/public/new.xml', function (req, res) {
   // res.setHeader('Content-disposition', 'attachment; filename=keystone.xml');
    res.sendFile(path.join(__dirname, '/public/new.xml'));
});

function appendToXml(callback, url, name, imgSrc, guids) {
    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');
    var serializer = require('js2xmlparser');
    var resend = callback;
    var filePath = path.join(__dirname, '/public/keystone.xml');
    
    fs.readFile(filePath, {}, function (err, data) {
        if (!err) {
            xml.parseString(data, function (err, parsedXml) {
                if (!err) {
                    var builder = new xml.Builder();
                    console.log(parsedXml.root.nodes[0].node.length);
                    parsedXml = appendPerson(parsedXml, {url: url, name: name, imgSrc: imgSrc, guids: guids});
                    console.log(parsedXml.root.nodes[0].node.length);

                    var serialized = builder.buildObject(parsedXml);

                    var saveFilePath = path.join(__dirname, '/public/new.xml');
                    fs.writeFile(saveFilePath, serialized, function(e) {
                        callback(saveFilePath);
                    });
                }
            });
        }
    });
};

function appendPerson(parsedXml, person) {
    var allNodes = parsedXml.root.nodes[0].node;
    var allEdges = parsedXml.root.edges[0].edge;
    
    // append person
    var newPerson = { $: {}};
    var uuid = require('uuid');
    newPerson.$.href = person.url;
    newPerson.$.id = uuid.v1();
    newPerson.$.img_src = person.imgSrc;
    newPerson.$.name = person.name;
    newPerson.$.type = 'person';
    allNodes[allNodes.length] = newPerson;
    
    // append edges
    var newPersonEdge = { $: {source: peopleGuid, target: newPerson.$.id} };
    allEdges[allEdges.length] = newPersonEdge;

    for (var i = 0; i < person.guids.length; i++) {
        allEdges[allEdges.length] = { $: { source: newPerson.$.id, target: person.guids[i]}};
       // allEdges[allEdges.length] = { $: { source: person.guids[i], target: newPerson.$.id}};
    }
    

    return parsedXml;
};

app.get('/add', function(req, res) {

    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');

    var filePath = path.join(__dirname, '/public/keystone.xml');

    fs.readFile(filePath, {}, function(err, data) {
        if (!err) {
            xml.parseString(data, function(err, parsedXml) {
                if (!err) {
                    var workgroups = getAllElementsOf(parsedXml, 'workgroup');
                    var countries = getAllElementsOf(parsedXml, 'country');
                    var entities = getAllElementsOf(parsedXml, 'entity');
                    var expertises = getAllElementsOf(parsedXml, 'expertise');

                    res.render('manageView', {
                        countries: countries, workgroups: workgroups, entities: entities, expertises: expertises,
                        scripts: ['javascripts/lib/jquery.min.js',
                            'javascripts/lib/bootstrap.min.js',
                            'javascripts/lib/bootstrap-multiselect.js',
                            'javascripts/manager/ScientistManager.js'
                        ],
                    stylesheets: [
                            'stylesheets/bootstrap.min.css',
                            'stylesheets/bootstrap-multiselect.css'
                    ]
                    });
                }
            });
        }
    });

});

function getAllEdges(parsedXml, id) {
    var results = [];
    var counter = 0;
    var edges = parsedXml.root.edges[0].edge;

    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i].$;

        if (edge.source === id) {
            results[counter] = { source: edge.source, target: edge.target };
            counter += 1;
        }
    }

    return results;
}

function getAllElementsOf(parsedXml, type) {
    var results = [];
    var counter = 0;
    var nodes = parsedXml.root.nodes[0].node;

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].$.hasOwnProperty("type")) {
            if (nodes[i].$.type === type) {
                results[counter] = { name: nodes[i].$.name, id: nodes[i].$.id, isSelected: false };
                counter += 1;
            }
        }
    }
    return results;
}

Array.prototype.contains = function(obj) {
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
        resultCountries[i] = { id: countries[i].$.id, name: countries[i]._, isSelected: selected };
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