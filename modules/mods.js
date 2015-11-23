var mods = [];
var db = require('./db.js');
var modCommands = [addModCmd];

exports.checkCommands = function(dataHash, callback) {
  for (command in modCommands) {
    var test = modCommands[command](dataHash.request, dataHash.owner, callback);
    if (test)
      return test;
  }

  return false;
}

exports.getMods = function() {
  return mods;
}

exports.isMod = function(id) {
  for (mod in mods) {
    if (mods[mod].id == id)
      return true;
  }

  return false;
}

exports.getModIDs = function() {
  var ids = [];

  for (mod in mods) {
    ids.push(mods[mod].id);
  }
  return ids;
}

exports.getModNames = function() {
  var names = [];

  for (mod in mods) {
    names.push(mods[mod].name);
  }
  return names;
}

exports.setMods = function(modHash) {
  mods = modHash;
}

exports.addMod = function(modHash) {
  mods.push(modHash);
}

function addModCmd(request, owner, callback) {
  var regex = /^\/addmod (.+) (\d+)/;

  if (regex.test(request.text)) {
    if (request.user_id != owner.id) {
      callback(true, "You wish you could add mods");
    }

    var val = regex.exec(request.text);
    db.findMod(val[1], function(res){
      if (res) {
        callback(true, "User already a mod");
      } else {
        var newMod = {name: val[1], id: val[2]};
        db.addMod(newMod);
        mods.push(newMod);
        callback(true, val[1] + " is now a mod.");
      }
    });
  } else {
    return false;
  }
}