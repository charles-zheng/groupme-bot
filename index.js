#!/bin/env node
var http, director, bot, router, server, port, db;

http        = require('http');
director    = require('director');
bot         = require('./bot.js');

router = new director.http.Router({
  '/'    : {
    get: ping
  },
  '/bot/:botRoom' : {
    get: ping,
    post: bot.respond
  }
  /*'/ra'  : {
    post: bot.respond,
    get: ping
  },
  '/raw' : {
    post: bot.respond,
    get: ping
  },
  '/ral' : {
    post: bot.respond,
    get: ping
  },
  '/ralv' : {
    post: bot.respond,
    get: ping
  },
  '/fo0' : {
    post: bot.respond,
    get: ping
  } */
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

server.listen(port, ip);

function ping() {
  this.res.writeHead(200);
  this.res.end("I am a robot.");
}