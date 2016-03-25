var db_table = 'rooms';
var db = require('./db.js');
var mod_config = require('../config/config.js');
var rooms;
var roomCommands = [cmdRoomAdd, cmdToken, cmdConfig];

getAllRooms();
exports.modName = "Rooms Control";

function getAllRooms(){
  db.getAllDocuments(db_table, function(res){
    rooms = [];
    for (room in res) {
      rooms[res[room].name] = res[room].id;
    }
  });
}

function addRoomToDB(room, callback){
  db.addDoc(db_table, room, callback);
}

function addConfigToDB(config, callback){
  db.addDoc('config', config, callback);
}

function setAccessTokenDB(config, callback){
  db.updateOneDoc('config', {config: config.config}, {$set: {'access_token': config.access_token}}, function(){
    mod_config.setConfig();
  });
}


exports.getRooms = function() {
  return rooms;
}

exports.getRoom = function(path) {
  var room = {};
  path = path.toLowerCase();

  if (rooms[path]) {
    room.type = path;
    room.id = rooms[path];
  }

  return room;
}

exports.checkCommands = function(dataHash, callback) {
  for (command in roomCommands) {
    var test = roomCommands[command](dataHash.request, dataHash.currentBot, dataHash.owner, callback);
    if (test)
      return test;
  }

  return false;
}

exports.getCmdListDescription = function () {
    cmdArr = [
    {cmd: "/room add 'name' 'id'", desc: "Add the bot to another room.", owner: true},
  ];

  return cmdArr;
}

function cmdRoomAdd(request, currentBot, owner, callback) {
  var regex = /^\/room add (.+?) (.+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);
    console.log(owner.id);
    if (request.user_id != owner.id || currentBot.type != 'config')
      return true;

    var roomHash = {
      name: val[1].toLowerCase(),
      id: val[2]
    };

    rooms[val[1]] = val[2];
    addRoomToDB(roomHash);
    var msg = val[1] + " room added! Your bot will now respond in in your new room";
    callback(true, msg, []);
    return msg;
  }
}

function cmdConfig(request, currentBot, owner, callback) {
  var regex = /^\/config (.+)/i;
  var reqText = request.text;

  if (regex.test(reqText)) {
    var val = regex.exec(reqText);

    if (rooms['config']){
      callback(true, "You've already set a config ID. If you wish to reset it for some reason, you'll need to clear the database and start over.")
      return true;
    } else if (val[1].length != 26) {
      callback(true, "That's not the right length for a Bot ID", []);
      return true;
    }

    rooms['config'] = val[1];
    addRoomToDB({
      name: 'config',
      id: val[1]
    });

    addConfigToDB({
      config: 'owner',
      id: request.user_id
    });

    var msg = 'Config Bot ID is set.\n\nYou will be recognized as the bot owner as well as a moderator.\n\nYou can add the bot to additional rooms.\n-First create the bot at dev.groupme.com, like you did the Config bot.\n-Change the end of the callback url form config to something different with no spaces.\n-This new end of the callback url needs to be the same as the name you pick for the add room command in the next step and should be unique to your other bots. It does not need to be the same name you chose for the name of the bot at dev.groupme.com, it just needs to be something you will recognize should you need to make changes.\n-Last use the /room add command as follows:\n/room add <name matching the end of the callback url> <Bot ID>\nEX: /room add foo dV82tx6bA6cstUZX7ghY7aho3y\n\nThere is a list of commands available by typing /commands.';
    callback(true, msg, []);
    return msg;
  }
}

function cmdToken(request, currentBot, owner, callback) {
  var regex = /^\/config token (.+)/i;
  var reqText = request.text;

  if (regex.test(reqText)) {
    if (request.user_id != owner.id || currentBot.type != 'config')
      return true;

    var val = regex.exec(reqText);

    setAccessTokenDB({
      config: 'owner',
      access_token: val[1]
    });

    var msg = 'Your access token has been saved.';
    callback(true, msg, []);
    return msg;
  }
}
