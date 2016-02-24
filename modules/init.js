var fs = require('fs');
var db = require('./db.js');

var indexHTML = '';

function loadIndexHTML(callback) {
  fs.readFile(path, 'utf8', function(err, data){
    indexHTML = data;
    callback(data);
  });
}

function getConfigBotID(callback) {
  db.findDocs('bots', {"name": 'config'}, function(res){
    callback(res);
  });
}

exports.initPage = function(req, callback){
  getConfigBotID(function(res){
    if(res){
      callback("I am a robot.");
    } else {
      console.log(this.req);
      callback("I gotta put some shit here");
      var url = this.req.headers.host;
    }
  });
}