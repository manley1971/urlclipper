'use strict';
var shortid = require('shortid');

var express = require('express');
var routes = require('./app/routes/index.js');
var passport = require('passport');
var session = require('express-session');
var mongo = require('mongodb');
var app = express();
require('dotenv').load();

app.use('/public', express.static(process.cwd() + '/public'));
var url = 'mongodb://localhost:27017/';

app.get('/new/https?\://:url', function(req, res) {
  console.log(JSON.stringify(req);
  let retval = {};
  let s = req.params.url;
  retval.id = shortid.generate();
  retval.original_url = req.params.url;
  mongo.connect (url, function (err, db)
    {
      var p = db.collection ('urls');
      p.insert(retval, function(err, data) {
      // handle error
       if (err) console.log("Error in insert.");    
      // other operations
      db.close ();
    });
   console.log(JSON.stringify(retval));
  });
  res.end(JSON.stringify(retval));
})

app.get('/:shortner', function(req, res) {
  console.log("redirect"+req.params.shortner);
  mongo.connect (url, function (err, db) {
    var p = db.collection ('urls'); 
    p.find ({},{}).toArray (function (err, docs) {
      console.log('-all'+JSON.stringify(docs)+'end all');
    });
    p.find ({"id":req.params.shortner},{"original_url":1}).toArray (function (err, docs) {
      if (docs&&docs[0]) {
        let redirect_url=docs[0].original_url;
        console.log('sel:'+JSON.stringify(redirect_url));
        res.writeHead(301,{Location: redirect_url});
  //      res.redirect(redirect_url);
      }
      else
        console.log('error: that token is not found');
      db.close ();
      res.end();
    });
  });
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});
 

