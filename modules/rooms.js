var db_table = 'rooms';
var db = require('./db.js');
var rooms;

getAllBots();
exports.modName = "Rooms Control";

function getAllRooms(){
  db.getAllDocuments(db_table, function(res){
    rooms = res;
  });
}

exports.getRooms = function() {
  return rooms;
}

exports.checkCommands = function(dataHash, callback) {
  return;
}

exports.getCmdListDescription = function () {
    cmdArr = [
    //{cmd: "/room add 'name' 'avatar url' ", desc: "Add a bot to the current room. The avatar URL is optional.", owner: true}
  ];

  return cmdArr;
}

function cmdRoomAdd(request, bots, owner, callback) {
  var regex = /^\/room add (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (request.user_id != owner.id)
      return true;

    var cmdHash = {
      name: val[1].toLowerCase(),
      regex: "^\/" + val[1] + "$",
      message: val[2],
    };

    commands.push(cmdHash);
    addCmdToDB(cmdHash);
    var msg = val[1] + " command added! please use \"/cmd describe " + val[1] + " <description>\" to add a description for your new command";
    callback(true, msg, []);
    return msg;
  }
}