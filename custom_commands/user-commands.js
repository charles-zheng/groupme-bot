var triggers;
var userCommands = [addCommandCmd, describeCmd];
db = require('../modules/db.js');

//init - make an init function
db.getTriggers(function(res){
  triggers = res;
});

exports.checkCommands = function(dataHash, callback) {
  for (trigger in triggers) {
    trigger = triggers[trigger];
    if ((trigger.system && dataHash.request.system) || (!trigger.system && !dataHash.request.system)) {
      var triggerReg = new RegExp(trigger.regex, "i");
      if (dataHash.request.text && triggerReg.test(dataHash.request.text)){
        var val = triggerReg.exec(dataHash.request.text);
        if (!dataHash.funMode && trigger.fun){
          callback(true, false, "Sorry I'm no fun right now.", []);
        } else if (trigger.apiHost && trigger.apiPath) {
          trigger.val = val[1];
          callback(true, true, trigger, trigger.attachments);
        } else {
          callback(true, false, trigger.message, trigger.attachments);
        }
        break;
      }
    }
  }

  for (cmd in userCommands) {
    var test = userCommands[cmd](dataHash.request, dataHash.bots, dataHash.isMod, callback);
    if (test)
      return test;
  }
}

exports.setAll = function(triggerHash) {
  triggers = triggerHash;
}

exports.getAll = function() {
  return triggers;
}

exports.getHTML = function() {
  var triggerStr = '<h3>The following custom commands are available:</h3><table>';

  for (trig in triggers) {
    triggerStr += '<tr>';
    triggerStr += '<td>/' + triggers[trig].name + '</td>';
    if (triggers[trig]["description"]) {
      triggerStr += '<td>' + triggers[trig]["description"]; + '</td>';
    } else {
      triggerStr += '<td></td>';
    }
    triggerStr += '</tr>';
  }

  triggerStr += '</table>';
  return triggerStr;
}

function addCommandCmd(request, bots, isMod, callback) {
  var regex = /^\/addcommand (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to add commands"
      callback(true, false, msg, []);
      return msg;
    }

    for (trigger in triggers) {
      if (triggers[trigger].name == val[1]) {
        var msg = val[1] + " already exists";
        callback(true, false, msg, []);
        return msg;
      }
    }

    var trigHash = {
      name: val[1],
      regex: "^\/" + val[1] + "$",
      message: val[2],
      bots: Object.keys(bots)
    };

    triggers.push(trigHash);
    db.addTrigger(trigHash);
    var msg = val[1] + " command added! please use /describe " + val[1] + " <description> to add a description for your new command";
    callback(true, false, msg, []);
    return msg;
  }
}

function describeCmd(request, bots, isMod, callback) {
  var regex = /^\/describe (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to describe commands"
      callback(true, false, msg, []);
      return msg;
    }

    for (trigger in triggers) {
      if (triggers[trigger].name == val[1]) {
        triggers[trigger]["description"] = val[2];
        db.updateTrigger(triggers[trigger]);
        var msg = val[1] + " description updated";

        callback(true, false, msg, []);
        return msg;
      }
    }

    var msg = val[1] + " doesn't exist";
    callback(true, false, msg, []);

    return msg;
  }
}