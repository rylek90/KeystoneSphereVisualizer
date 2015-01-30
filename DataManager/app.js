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

app.get('/public/javascripts/lib/bootstrap-multiselect.js', function(req, res) {
    res.sendfile(__dirname + '/public/javascripts/lib/bootstrap-multiselect.js');
});

app.get('/public/stylesheets/bootstrap.min.css', function(req, res) {
    res.sendfile(__dirname + '/public/stylesheets/bootstrap.min.css');
});

app.get('/public/stylesheets/bootstrap-multiselect.css', function(req, res) {
    res.sendfile(__dirname + '/public/stylesheets/bootstrap-multiselect.css');
});

app.get('/public/javascripts/manager/ScientistManager.js', function(req, res) {
    res.sendfile(__dirname + '/public/javascripts/manager/ScientistManager.js');
});

app.post('/postData', function(req, res) {
    var data = req.body;


    var guids = [data.country, data.entity];

    var expertises = data['expertises[]'];
    var workgroups = data['workgroup[]'];

    if (expertises) {

        if (Array.isArray(expertises)) {
            for (var i = 0; i < expertises.length; i++) {
                guids[guids.length] = expertises[i];
            }
        } else {
            guids[guids.length] = expertises;
        }
    }
    
    if (workgroups) {
        if (Array.isArray(workgroups)) {
            for (var i = 0; i < workgroups.length; i++) {
                guids[guids.length] = workgroups[i];
            }
        } else {
            guids[guids.length] = workgroups;
        }
    }

    appendToXml(data.url, data.name, data.imgSrc, guids, data.id);

    res.end();
});

function removePerson(parsedXml, userId) {
    var allEdges = parsedXml.root.edges[0].edge;
    var allNodes = parsedXml.root.nodes[0].node;
    var newEdges = [];
    var newNodes = [];
    
    for (var i = 0; i < allNodes.length; i++) {
        if (allNodes[i].$.id != userId) {
            newNodes.push(allNodes[i]);
        } else {
            console.log('usuwam');
        }
    }

    for (var i = 0; i < allEdges.length; i++) {
        if (allEdges[i].$.source != userId && allEdges[i].$.target != userId) {
            newEdges.push(allEdges[i]);
        }
    }

    console.dir(parsedXml);
    var dollar = {
        root_node_id: parsedXml.root.$.root_node_id
    };

    var root = {
        $: dollar,
        nodes: [ { node: newNodes}],
        edges: [{ edge: newEdges }]
    };

    var newCollection = {
      root:  root
    };

    return newCollection;
}

function appendToXml(url, name, imgSrc, guids, id) {
    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');
    var filePath = path.join(__dirname, '/public/keystone.xml');

    var backUp = path.join(__dirname, '/public/keystoneBackup.xml');
    fs.writeFileSync(backUp, fs.readFileSync(filePath));

    fs.readFile(filePath, {}, function(err, data) {
        if (!err) {
            xml.parseString(data, function(err, parsedXml) {
                if (!err) {
                    var builder = new xml.Builder();
                    console.log(parsedXml.root.nodes[0].node.length);
                    console.log(parsedXml.root.edges[0].edge.length);
                    if (id) {
                        parsedXml = removePerson(parsedXml, id);
                    }
                    parsedXml = appendPerson(parsedXml, { url: url, name: name, imgSrc: imgSrc, guids: guids, id: id });
                    console.log(parsedXml.root.edges[0].edge.length);
                    console.log(parsedXml.root.nodes[0].node.length);

                    var serialized = builder.buildObject(parsedXml);

                    var saveFilePath = path.join(__dirname, '/public/keystone.xml');
                    fs.writeFile(saveFilePath, serialized);
                }
            });
        }
    });
};

function appendPerson(parsedXml, person) {
    var allNodes = parsedXml.root.nodes[0].node;
    var allEdges = parsedXml.root.edges[0].edge;

    // append person

    var newPerson = { $: {} };
    var uuid = require('uuid');
    newPerson.$.href = person.url;

    if (!person.id || person.id == '') {
        newPerson.$.id = uuid.v1();
    } else {
        newPerson.$.id = person.id;
    }
    newPerson.$.img_src = person.imgSrc;
    newPerson.$.name = person.name;
    newPerson.$.type = 'person';
    allNodes[allNodes.length] = newPerson;

    // append edges
    var newPersonEdge = { $: { source: peopleGuid, target: newPerson.$.id } };
    allEdges[allEdges.length] = newPersonEdge;
    for (var i = 0; i < person.guids.length; i++) {
        allEdges[allEdges.length] = { $: { source: newPerson.$.id, target: person.guids[i] } };
        // allEdges[allEdges.length] = { $: { source: person.guids[i], target: newPerson.$.id}};
    }


    return parsedXml;
};

app.get('/add', function(req, res) {

    var fs = require('fs');
    var path = require('path');
    var xml = require('xml2js');

    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var id = url_parts.query.id;

    var filePath = path.join(__dirname, '/public/keystone.xml');

    fs.readFile(filePath, {}, function(err, data) {
        if (!err) {
            xml.parseString(data, function(err, parsedXml) {
                if (!err) {

                    var person = undefined;

                    if (id) {
                        person = getPerson(parsedXml, id);
                    }

                    var workgroups = getAllElementsOf(parsedXml, 'workgroup');
                    var countries = getAllElementsOf(parsedXml, 'country');
                    var entities = getAllElementsOf(parsedXml, 'entity');
                    var expertises = getAllElementsOf(parsedXml, 'expertise');

                    var edges;
                    if (id) {
                        edges = getAllEdges(parsedXml, id);
                    }
                    if (edges) {
                        workgroups = applySelections(workgroups, edges);
                        countries = applySelections(countries, edges);
                        entities = applySelections(entities, edges);
                        expertises = applySelections(expertises, edges);
                    }

                    res.render('manageView', {
                        countries: countries,
                        workgroups: workgroups,
                        entities: entities,
                        expertises: expertises,
                        person: person,
                        scripts: [
                            'javascripts/lib/jquery.min.js',
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

var selectionDebug = 0;

function applySelections(nodes, edges) {

    var edgesTargets = [];

    for (var i = 0; i < edges.length; i++) {
        edgesTargets.push(edges[i].target);
    }

    for (var i = 0; i < nodes.length; i++) {

        if (edgesTargets.contains(nodes[i].id)) {
            nodes[i].isSelected = true;
            selectionDebug += 1;
            console.log("associated selection");
            console.log(selectionDebug);
        }
    }

    return nodes;
}

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

function getPerson(parsedXml, id) {
    var people = parsedXml.root.nodes[0].node;
    for (var i = 0; i < people.length; i++) {
        if (people[i].$.id == id) {
            console.dir(people[i]);
            return people[i].$;
        }
    }
}

module.exports = app;