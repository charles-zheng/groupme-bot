var fun_command = true;
var cmds = [cmdRonSwanson];

var HTTPS = require('https');

exports.modName = "Ron Swanson";

exports.checkCommands = function(dataHash, callback) {
  cmds.some(function(cmd){
    return cmd(dataHash.funMode, dataHash.request.text, callback);
  });
}

exports.getCmdListDescription = function () {
  var cmdArr = [
    {cmd: "/ron", desc: "Responds with a random Ron Swanson quote.", fun: true}
  ];

  return cmdArr;
}

function cmdRonSwanson(funMode, request, callback){
  var regex = /^\/ron/i;
  
  if (regex.test(request)){
    if(!funMode){
      callback(true, "Sorry I'm no fun right now.", []);
      return "Sorry I'm no fun right now.";
    }
    
    var val = regex.exec(request);

    var options = {
      hostname: "ron-swanson-quotes.herokuapp.com",
      path: "/v2/quotes"
    };
  
    var callbackAPI = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);
        
        var msg = str[0];
        /*if (typeof(str.facts[0]) !== 'undefined'){
          msg = str.facts[0];
        } else {
          msg = "I don't like cats.";
        }*/

        callback(true, msg, []);
      });
    };

    HTTPS.request(options, callbackAPI).end();
  } else {
    return false;
  }
}