var fun_command = true;
var cmds = [cmdUrban, cmdUrbanRnd];

var HTTPS = require('https');

exports.modName = "Urban Dictionary";

exports.checkCommands = function(dataHash, callback) {
  cmds.some(function(cmd){
    return cmd(dataHash.funMode, dataHash.request.text, callback);
  });
}

exports.getCmdListDescription = function () {
  var cmdArr = [
    {cmd: "/urban 'string'", desc: "Responds with the first dictionary found on Urban Dictionary.", fun: true}
  ];

  return cmdArr;
}

function cmdUrbanRnd(funMode, request, callback){
  var regex = /^\/urban/i;
  
  if (regex.test(request)){
    if(!funMode){
      callback(true, "Sorry I'm no fun right now.", []);
      return "Sorry I'm no fun right now.";
    }

    var options = {
      hostname: "api.urbandictionary.com",
      path: "/v0/random",
      rejectUnauthorized: false
    };

    var callbackAPI = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);
        
        var msg = '';
        if (typeof(str.list[0].definition) !== 'undefined'){
          msg = str.list[0].word + " - " + str.list[0].definition;
        } else {
          msg = "That's not even found in a fake internet dictionary.";
        }

        callback(true, msg, []);
      });
    };
    
    HTTPS.request(options, callbackAPI).end();
  } else {
    return false;
  }
}

function cmdUrban(funMode, request, callback){
  var regex = /^\/urban (.+)/i;
  
  if (regex.test(request)){
    if(!funMode){
      callback(true, "Sorry I'm no fun right now.", []);
      return "Sorry I'm no fun right now.";
    }

    var val = regex.exec(request);

    var options = {
      hostname: "api.urbandictionary.com",
      path: "/v0/define?term=" + encodeURIComponent(val[1]),
      rejectUnauthorized: false
    };

    var callbackAPI = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);
        
        var msg = '';
        if (typeof(str.list[0].definition) !== 'undefined'){
          msg = str.list[0].definition;
        } else {
          msg = "That's not even found in a fake internet dictionary.";
        }

        callback(true, msg, []);
      });
    };
    
    HTTPS.request(options, callbackAPI).end();
  } else {
    return false;
  }
}