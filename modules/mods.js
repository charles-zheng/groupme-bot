var mods = [];
var db = require('./db.js');
var db_table = 'mods';
var modCommands = [addModCmd, listModsCmd];

getAllMods();
exports.modName = "Mod Control";

function getAllMods() {
  db.getAllDocuments(db_table, function(res){
    mods = res;
  });
}

function addModToDB(mod, callback) {
  db.addDoc(db_table, mod, callback);
}

function findMod(id) {
  for (mod in mods){
    if (mods[mod].id == id)
      return true;
  }

  return false;
}

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

exports.getModNames = getModNames;

exports.setMods = function(modHash) {
  mods = modHash;
}

exports.addMod = function(modHash) {
  mods.push(modHash);
}

exports.getCmdListDescription = function () {
  return [
    {cmd: "/mod add 'name' 'tag the user'", desc: "Owner command to add mods", owner: true},
    {cmd: "/mod list", desc: "List names of current mods"}
  ];
}

function getModNames(){
  var names = [];

  for (mod in mods) {
    names.push(mods[mod].name);
  }
  return names;
}

function addModCmd(request, owner, callback) {
  var regex = /^\/mod add (.+?) ([\s\S]+)/i;

  if (regex.test(request.text)) {
    if (request.user_id != owner.id) {
      callback(true, "You wish you could add mods", []);
      return "You wish you could add mods.";
    }

    if (!request.attachments[0].user_ids){
      callback(true, "You have to mention the user you want to mod using @");
      return "You have to mention the user you want to mod user @";
    }

    var val = regex.exec(request.text);
    val[2] = request.attachments[0].user_ids[0];
    if (findMod(val[2])) {
      callback(true, "User already a mod", []);
    } else {
      var newMod = {name: val[1], id: val[2]};
      addModToDB(newMod);
      mods.push(newMod);
      callback(true, val[1] + " is now a mod.", []);
    }
  } else {
    return false;
  }
}

function listModsCmd(request, owner, callback) {
  var regex = /^\/mod list$/;

  if (regex.test(request.text)) {
    var str = "Current mods are: "
    str += getModNames().toString().replace(/,/g, ', ');
    callback(true, str);
  }
}