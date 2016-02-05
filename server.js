'use strict';
//the shortid module is not liked by heroku
//var shortid = require('shortid');

var express = require('express');
var routes = require('./app/routes/index.js');
var session = require('express-session');
var mongo = require('mongodb');
var app = express();
var shortid = "a";
require('dotenv').load();

var url = 'mongodb://localhost:27017/';
app.use('/public', express.static(process.cwd() + '/public'));

//Is this a url to add to our collection?
app.get('/new/https?\://:url', function(req, res) {
//    console.log(req);
    let retval = {};
    let s = req.params.url;
    retval.id = shortid;
    shortid=shortid+"a";
    retval.original_url = req.url.split("new/")[1];
    mongo.connect(url, function(err, db) {
    //if for some reason we did not connect to the db we don't want to crash.
      if (!db) {
          console.log("********no db**********");
	  res.end("mongo is not running");
       }
      else {
       var p = db.collection('urls');
        p.insert(retval, function(err, data) {
            // handle error
            if (err) console.log("Error in db insert.");
            // other operations
            db.close();
        });
     }
    });
    res.end(JSON.stringify(retval));
})

// or is this obviously poorly formed
app.get('/new/*', function(req, res) {
    let retval = {
        "error": "URL invalid"
    };
    res.send(JSON.stringify(retval));
});

//the user is presented a key for which they wish to be redirected
app.get('/:shortner', function(req, res) {
    mongo.connect(url, function(err, db) {
        if (!db) {
          console.log("no db");
	  res.end("mongo is not running");
       }

       else {
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
                console.log('Token is not found');
                let retval = {
                    "error": "No short url for given input"
                };
                res.send(JSON.stringify(retval));
            }
            db.close();
            res.end();
        
        });
      }
    });
});

app.use('/', express.static(process.cwd() + '/public'));
var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});
