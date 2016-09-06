var triggers;
var db_table = 'api_triggers';

var fun_command = true;

var db      = require('../modules/db.js');
var HTTPS   = require('https');

getAllTriggers();
exports.modName = "Api Commands";

function getAllTriggers() {
  db.getAllDocuments(db_table, function(res){
    triggers = res;
  });
}

exports.checkCommands = function(dataHash, callback) {
  for (var trigger in triggers) {
    trigger = triggers[trigger];
    var triggerReg = new RegExp(trigger.regex, "i");
    if (dataHash.request.text && triggerReg.test(dataHash.request.text)){
      var val = triggerReg.exec(dataHash.request.text);
      if (!dataHash.funMode && fun_command){
        callback(true, "Sorry I'm no fun right now.", []);
      } else {
        trigger.val = val[1];
        apiRequest(trigger.apiHost, trigger.apiPath, val[1], trigger.message, trigger.failMessage, function(msg){
          callback(true, msg, []);
        });
      }
      break;
    }
  }
}

exports.setAll = function(triggerHash) {
  triggers = triggerHash;
}

exports.getAll = function() {
  return triggers;
}

exports.getCmdListDescription = function () {
  return null;
}

function apiRequest(host, path, input, returnProperty, failMsg, apiCallback) {
  path = path.replace("$$1", encodeURIComponent(input));

  var options = {
    hostname: host,
    path: path
    //rejectUnauthorized: false
  };
  var props = returnProperty.split('.');

  var callback = function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      str = JSON.parse(str);
      var msg = str;

      for (var prop in props) {
        if (typeof(msg[props[prop]]) !== 'undefined') {
          msg = msg[props[prop]];
        } else {
          msg = failMsg;
        }
      }

      apiCallback(msg);
    });
  };

  HTTPS.request(options, callback).end();
}

/*
{
  "apiHost": "api.urbandictionary.com",
  "apiPath": "/v0/define?term=$$1",
  "description": "Fun command to get a random urban dictionary definition",
  "failMessage": "Not even Urban dictionary has a definition for your nonsense.",
  "fun": true,
  "message": "list.0.definition",
  "name": "urban",
  "regex": "^/urban (.+)",
  "system": false
}
*/