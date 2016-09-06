var fun_command = true;
var cmds = [cmdCatFact];

var HTTPS = require('https');

exports.modName = "Cat Fact";

exports.checkCommands = function(dataHash, callback) {
  cmds.some(function(cmd){
    return cmd(dataHash.funMode, dataHash.request.text, callback);
  });
}

exports.getCmdListDescription = function () {
  var cmdArr = [
    {cmd: "/catfact", desc: "Responds with a random cat fact.", fun: true}
  ];

  return cmdArr;
}

function cmdCatFact(funMode, request, callback){
  var regex = /^\/catfact/i;
  
  if (regex.test(request)){
    if(!funMode){
      callback(true, "Sorry I'm no fun right now.", []);
      return "Sorry I'm no fun right now.";
    }
    
    var val = regex.exec(request);

    var options = {
      hostname: "catfacts-api.appspot.com",
      path: "/api/facts"
    };
  
    var callbackAPI = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);
        
        var msg = '';
        if (typeof(str.facts[0]) !== 'undefined'){
          msg = str.facts[0];
        } else {
          msg = "I don't like cats.";
        }

        callback(true, msg, []);
      });
    };

    HTTPS.request(options, callbackAPI).end();
  } else {
    return false;
  }
}