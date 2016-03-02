var cmds = [cmdAtEveryone];
var HTTPS  = require('https');

//exports
exports.modName = "At Everyone";

exports.checkCommands = function(dataHash, callback) {
  for (cmd in cmds) {
    var test = cmds[cmd](dataHash.request, dataHash.bots, dataHash.isMod, dataHash.owner, callback);
    if (test)
      return test;
  }
}

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "@everyone", desc: "Pings everyone in the current room. With great power comes great responsibility.", mod: true}
  ];

  return cmdArr;
}

function cmdAtEveryone(request, bots, isMod, owner, callback) {
  var regex = /@everyone/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!owner.access_token)
      return;

    if (!isMod) {
      var msg = "You don't have permission to ping everyone";
      callback(true, msg, []);
      return msg;
    }

    getUserIDs(owner.access_token, request.group_id, function(userIDs, msg){
      var attachments = [{
        "loci": [],
        "type": "mentions",
        "user_ids": []
      }];

      var loci = [];
      var user = [];

      for(user in userIDs){
        attachments[0]["loci"].push([24, request.name.length]);
        attachments[0]["user_ids"].push(userIDs[user]);
      }

      var msg = "Hey everyone listen up! " + request.name + " has shared something important!";
      callback(true, msg, attachments);
    });

    return msg;
  }
}

function getUserIDs(ownerID, groupID, apiCallback) {
  var options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups?token=' + ownerID
  };

  callback = function(response) {
    str = '';

    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      str = JSON.parse(str);
      msg = str;
      for (room in msg.response) {
        if (msg.response[room].id == groupID){
          var userIdArr = []
          for(user in msg.response[room].members){
            userIdArr.push(msg.response[room].members[user].user_id);
          }
          apiCallback(userIdArr);
        }
      }
    });
  };

  HTTPS.request(options, callback).end();
}