var triggers;
var modCommands = [addTriggerCmd];
db = require('./db.js');

exports.checkTriggerCommands = function(request, currentBot, funMode, bots, isMod, callback) {
  for (trigger in triggers) {
    trigger = triggers[trigger];
    if ((trigger.system && request.system) || (!trigger.system && !request.system)) {
      var triggerReg = new RegExp(trigger.regex, "i");
      if (trigger.bots.indexOf(currentBot.type) > -1 && request.text && triggerReg.test(request.text)){
        var val = triggerReg.exec(request.text);
        if (!funMode && trigger.fun){
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

  for (cmd in modCommands) {
    var test = modCommands[cmd](request, triggers, bots, isMod, callback);
    if (test)
      return test;
  }
}

exports.setTriggers = function(triggerHash) {
  triggers = triggerHash;
}

exports.getTriggers = function(triggerHash) {
  return triggers;
}

function addTriggerCmd(request, triggers, bots, isMod, callback) {
  var regex = /^\/addtrigger (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    for (trigger in triggers) {
      if (triggers[trigger].name == val[1]) {
        var msg = val[1] + " already exists";
        callback(true, false, msg, []);
        return msg;
      }
    }

    if (!isMod) {
      var msg = "You don't have permission to add commands"
      callback(true, false, msg, []);
      return msg;
    }

    var trigHash = {
      name: val[1],
      regex: "^\/" + val[1] + "$",
      message: val[2],
      bots: Object.keys(bots)
    };

    triggers.push(trigHash);
    db.addTrigger(trigHash);
    var msg = val[1] + " trigger added!";
    callback(true, false, msg, [])
    return msg;
  }
}