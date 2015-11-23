//A module for handling responses triggered by groupme system messages
var triggers;
var sysTriggersCommands = [addCommandCmd, describeCmd];
db = require('../modules/db.js');

//init - make an init function
db.getSysTriggers(function(res){
  triggers = res;
});

exports.checkCommands = function(dataHash, callback) {
  if (dataHash.request.system) {
    for (trigger in triggers) {
      trigger = triggers[trigger];
      var triggerReg = new RegExp(trigger.regex, "i");
      if (trigger.bots.indexOf(dataHash.currentBot.type) > -1 && dataHash.request.text && triggerReg.test(dataHash.request.text)){
        var val = triggerReg.exec(dataHash.request.text);

        callback(true, false, trigger.message, trigger.attachments);
        break;
      }
    }
  }

  for (cmd in sysTriggersCommands) {
    var test = sysTriggersCommands[cmd](dataHash.request, dataHash.bots, dataHash.isMod, callback);
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
  var triggerStr = '<h3>The following system triggers are active:</h3><table>';

  for (trig in triggers) {
    triggerStr += '<tr>';
    triggerStr += '<td>' + triggers[trig].name + '</td>';
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
  var regex = /^\/addsystrigger (.+?) ([\s\S]+)/i;
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
    db.addSysTrigger(trigHash);
    var msg = val[1] + " command added!";
    callback(true, false, msg, []);
    return msg;
  }
}

function describeCmd(request, bots, isMod, callback) {
  var regex = /^\/describe-system-trigger (.+?) ([\s\S]+)/i;
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
        db.updateSysTrigger(triggers[trigger]);
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