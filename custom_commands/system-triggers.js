//A module for handling responses triggered by groupme system messages
var triggers;
var db_table = 'system_triggers';
var sysTriggersCommands = [addCommandCmd, describeCmd];
var db = require('../modules/db.js');

getAllTriggers();
exports.modName = "System Triggers";

function getAllTriggers() {
  db.getAllDocuments(db_table, function(res){
    triggers = res;
  });
}

function addSystemTriggerToDB(trigger, callback) {
  db.addDoc(db_table, trigger, callback);
}

function updateSystemTriggerDesc(trigger, callback) {
  db.updateOneDoc(db_table, {"name": trigger.name}, {$set: { "description": trigger.description}}, callback);
}

exports.checkCommands = function(dataHash, callback) {
  if (dataHash.request.system) {
    for (trigger in triggers) {
      trigger = triggers[trigger];
      var triggerReg = new RegExp(trigger.regex, "i");
      if (trigger.bots.indexOf(dataHash.currentBot.type) > -1 && dataHash.request.text && triggerReg.test(dataHash.request.text)){
        var val = triggerReg.exec(dataHash.request.text);

        callback(true, trigger.message, []);
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

exports.getCmdListDescription = function () {
  return null;
}

function addCommandCmd(request, bots, isMod, callback) {
  var regex = /^\/addsystrigger (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = request.name + " you have no power here!";
      callback(true, msg, []);
      return msg;
    }

    for (trigger in triggers) {
      if (triggers[trigger].name == val[1]) {
        var msg = val[1] + " already exists";
        callback(true, msg, []);
        return msg;
      }
    }

    var trigHash = {
      name: val[1],
      regex: val[1],
      message: val[2],
      bots: Object.keys(bots)
    };

    triggers.push(trigHash);
    addSystemTriggerToDB(trigHash);
    var msg = val[1] + " system trigger added!";
    callback(true, msg, []);
    return msg;
  }
}

function describeCmd(request, bots, isMod, callback) {
  var regex = /^\/describe-system-trigger (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = request.name + " who you trying to kid?";
      callback(true, msg, []);
      return msg;
    }

    for (trigger in triggers) {
      if (triggers[trigger].name == val[1]) {
        triggers[trigger]["description"] = val[2];
        updateSystemTriggerDesc(triggers[trigger]);
        var msg = val[1] + " description updated";

        callback(true, msg, []);
        return msg;
      }
    }

    var msg = val[1] + " doesn't exist";
    callback(true, msg, []);

    return msg;
  }
}