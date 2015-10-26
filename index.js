#!/bin/env node
var http, director, bot, router, server, port;

http        = require('http');
director    = require('director');
bot         = require('./bot.js');

router = new director.http.Router({
  '/'    : {
    get: ping
  },
  '/ra'  : {
    post: bot.respond,
    get: ping
  },
  '/raw' : {
    post: bot.respond,
    get: ping
  },
  '/fo0' : {
    post: bot.respond,
    get: ping
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

port = Number(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var connection_string = '127.0.0.1:27017/nodejs';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

server.listen(port, ip);

function ping() {
  this.res.writeHead(200);
  this.res.end("I am a robot.");
}