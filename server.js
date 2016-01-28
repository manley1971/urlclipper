'use strict';
var shortid = require('shortid');

var express = require('express');
var routes = require('./app/routes/index.js');
var passport = require('passport');
var session = require('express-session');
var mongo = require('mongodb');
var app = express();
require('dotenv').load();

var url = 'mongodb://localhost:27017/';
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/new/https\://:url', function(req, res) {
    let retval = {};
    let s = req.params.url;
    retval.id = shortid.generate();
    retval.original_url = "https:\/\/" + s;
    mongo.connect(url, function(err, db) {
        var p = db.collection('urls');
        p.insert(retval, function(err, data) {
            // handle error
            if (err) console.log("Error in db insert.");
            // other operations
            db.close();
        });
    });
    res.end(JSON.stringify(retval));
})

app.get('/new/http\://:url', function(req, res) {
    let retval = {};
    let s = req.params.url;
    retval.id = shortid.generate();
    retval.original_url = "http:\/\/" + s;
    mongo.connect(url, function(err, db) {
        var p = db.collection('urls');
        p.insert(retval, function(err, data) {
            // handle error
            if (err) console.log("Error in database insert for an http request.");
            // other operations
            db.close();
        });
    });
    res.end(JSON.stringify(retval));
})

app.get('/new/*', function(req, res) {
    let retval = {
        "error": "URL invalid"
    };
    res.send(JSON.stringify(retval));
});

app.get('/:shortner', function(req, res) {
    mongo.connect(url, function(err, db) {
        var p = db.collection('urls');
        p.find({
            "id": req.params.shortner
        }, {
            "original_url": 1
        }).toArray(function(err, docs) {
            if (docs && docs[0]) {
                let redirect_url = docs[0].original_url;
                console.log('sel:' + JSON.stringify(redirect_url));
                res.writeHead(301, {
                    Location: redirect_url
                });
            } else {
                console.log('error: that token is not found');
                let retval = {
                    "error": "No short url for given input"
                };
                res.send(JSON.stringify(retval));
            }
            db.close();
            res.end();
        });
    });
});

app.use('/', express.static(process.cwd() + '/public'));
var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});
