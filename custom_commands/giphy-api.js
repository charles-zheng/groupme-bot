var fun_command = true;
var cmds = [cmdGif];

var HTTPS = require('https');

exports.modName = "Giphy Api";

exports.checkCommands = function(dataHash, callback) {
  cmds.some(function(cmd){
    return cmd(dataHash.funMode, dataHash.request.text, callback);
  });
}

exports.getCmdListDescription = function () {
  var cmdArr = [
    {cmd: "/gif 'string'", desc: "Fun command to search giphy for a random gif based on a search string.", fun: true}
  ];

  return cmdArr;
}

function cmdGif(funMode, request, callback){
  var regex = /^\/gif (.+)/i;
  
  if (regex.test(request)){
    if(!funMode){
      callback(true, "Sorry I'm no fun right now.", []);
      return "Sorry I'm no fun right now.";
    }
    
    var val = regex.exec(request);

    var options = {
      hostname: "api.giphy.com",
      path: "/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=" + encodeURIComponent(val[1])
    };
  
    var callbackGif = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);
        
        var msg = '';
        if (typeof(str.data.image_original_url) !== 'undefined'){
          msg = str.data.image_original_url;
        } else {
          msg = "No such GIF silly.";
        }

        callback(true, msg, []);
      });
    };

    HTTPS.request(options, callbackGif).end();
  } else {
    return false;
  }
}