'use strict';
//the shortid module is not liked by heroku
//var shortid = require('shortid');
var mongoose = require('mongoose');

var express = require('express');
var routes = require('./app/routes/index.js');
var session = require('express-session');
var app = express();
var shortid = "c";
require('dotenv').load();

app.use('/public', express.static(process.cwd() + '/public'));
// we use mongoose managed by mongolab 
console.log("mongo uri:"+process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI);

var SiteSchema = new mongoose.Schema({
    short_url: String,
    original_url: String,
});
let sModel = mongoose.model('SiteList', SiteSchema);

//Is this a url to add to our collection?
app.get('/new/https?\://:url', function(req, res) {
    let retval = {};
    retval.original_url = req.url.split("new/")[1];
    console.log(retval.original_url);
    let q = sModel.find({original_url:retval.original_url}, {
        _id: 0,
        __v: 0
    });
    if (q) 
      q.exec(function(err, data) {
        if (err) res.end("probably the sites were about cats anyway, but there was an error looking it up..");
        if (data&&data.length) {
          retval.short_id = data;
          console.log("found:" + JSON.stringify(data));
          res.end(JSON.stringify(retval));
        }
        else {
          console.log("not found:" + JSON.stringify(data));
          retval.short_id = shortid;
          retval.comment="this service is something like a bookmark";
          res.end(JSON.stringify(retval));
          let newSearch = new sModel({
            original_url:retval.original_url,
            short_url:shortid
          });
          newSearch.save();
          shortid=shortid+"a";
        }
      });
    else 
      res.end(JSON.stringify("error: query is null, mongo is maybe down"));

});

// or is this obviously poorly formed
app.get('/new/*', function(req, res) {
    let retval = {
        "error": "URL invalid"
    };
    res.send(JSON.stringify(retval));
});

//the user is presented a key for which they wish to be redirected
app.get('/:shortner', function(req, res) {
   console.log("requesting shortened site:"+req.params.shortner);
   let s = req.params.shortner;
   let q = sModel.find({short_url:s}, {
        _id: 0,
        __v: 0
    });
    ////submit query that gets everything
    if (q) 
      q.exec(function(err, data) {
        if (err) res.end("probably the sites were about cats anyway, but there was an error looking it up..");
        if (data && data.length) {
          console.log("found in database, time to relocate to: "+data[0].original_url);
          res.writeHead(301, {
                    Location: data[0].original_url
          });
          res.end();
        } else {
          console.log('Token is not found');
          let retval = {"error": "No short url for given input"};
          res.end(JSON.stringify(retval));
        }
    });
});

app.use('/', express.static(process.cwd() + '/public'));

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});
