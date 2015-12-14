//consider factory model / dependecy injection
var mentions;
var userMentions = [addMention, describeMention, editMention, removeMention];

var db = require('../modules/db.js');
var db_table = 'user_mentions';

//init - make an init function
getAllMentions();

//Database managing commands ... not sure if this is the right place for these
function getAllMentions() {
  db.getAllDocuments(db_table, function(res){
    mentions = res;
  });
}

function addMentionToDB(mention, callback) {
  db.addDoc(db_table, mention, callback);
}

function updateMentionDB(mention, updateJson, callback){
  var findHash = {
    "name": mention["name"]
  };

  db.updateOneDoc(db_table, findHash, updateJson, callback);
}

function describeMentionDB(mention, callback) {
  var updateHash = {
    $set: {
      "description": mention["description"]
    }
  };

  updateMentionDB(mention, updateHash, callback);
}

function changeMsgMentionDB(mention, callback) {
  var updateHash = {
    $set: {
      "message": mention["message"]
    }
  };

  updateMentionDB(mention, updateHash, callback);
}

function deleteMentionFromDB(mention, callback){
  var findJson = { "name": mention["name"] };

  db.removeOneDoc(db_table, findJson);
}

//exports
exports.checkCommands = function(dataHash, callback) {
  for (mention in mentions) {
    mention = mentions[mention];
    var mentionReg = new RegExp(mention.regex, "i");
    if (dataHash.request.text && mentionReg.test(dataHash.request.text)){
      var val = mentionReg.exec(dataHash.request.text);
      callback(true, mention.message, mention.attachments);
      break;
    }
  }

  for (mention in userMentions) {
    var test = userMentions[mention](dataHash.request, dataHash.bots, dataHash.isMod, callback);
    if (test)
      return test;
  }
}

exports.setAll = function(mentionHash) {
  mentions = mentionHash;
}

exports.getAll = function() {
  return mentions;
}

//probably should make a function to return objects of mod commands and non mod commands
//they can be compiled by some outside command into sortable html for easy viewing
exports.getHTML = function() {
  var cmdStr = '<h3>The following custom mentions are available:</h3><table>';
  cmdStr += "<tr><td span='2'>Mod Commands</td></tr>";
  cmdStr += "<tr><td>/mention add 'name' 'message'</td><td>Add a new command that replies with <message></td></tr>";
  cmdStr += "<tr><td>/mention describe 'name' 'description'</td><td>Sets the description of the command for this list</td></tr>";
  cmdStr += "<tr><td>/mention edit 'name' 'new message'</td><td>Changes the response of an existing command</td></tr>";
  cmdStr += "<tr><td>/mention remove 'name'</td><td>Deletes a command";
  cmdStr += "<tr><td span='2'>Non Mod Commands</td></tr>";
  for (mention in mentions) {
    cmdStr += '<tr>';
    cmdStr += '<td>@' + mentions[mention].name + '</td>';
    if (mentions[mention]["description"]) {
      cmdStr += '<td>' + mentions[mention]["description"]; + '</td>';
    } else {
      cmdStr += '<td></td>';
    }
    cmdStr += '</tr>';
  }

  cmdStr += '</table>';
  return cmdStr;
}

function addMention(request, bots, isMod, callback) {
  var regex = /^\/mention add (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to add mentions"
      callback(true, msg, []);
      return msg;
    }

    for (mention in mentions) {
      if (mentions[mention].name == val[1]) {
        var msg = val[1] + " already exists";
        callback(true, msg, []);
        return msg;
      }
    }

    for (loc in request.attachments[0].loci) {
      request.attachments[0].loci[loc][0] -= 14 + val[1].length;
    }
    var mentionHash = {
      name: val[1].toLowerCase(),
      attachments: request.attachments,
      regex: "@" + val[1],
      message: val[2],
    };

    mentions.push(mentionHash);
    addMentionToDB(mentionHash);
    var msg = val[1] + " mention added! please use \"/mention describe " + val[1] + " <description>\" to add a description for your new custom mention";
    callback(true, msg, []);
    return msg;
  }
}

function describeMention(request, bots, isMod, callback) {
  var regex = /^\/mention describe (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to describe mentions"
      callback(true, msg, []);
      return msg;
    }

    for (mention in mentions) {
      if (mentions[mention].name == val[1].toLowerCase()) {
        mentions[mention]["description"] = val[2];
        describeMentionDB(mentions[mention]);

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

function removeMention(request, bots, isMod, callback) {
  var regex = /^\/mention remove (.+)/i;
  var reqText = request.text.toLowerCase();

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to remove mentions"
      callback(true, msg, []);
      return msg;
    }

    val[1] = val[1].toLowerCase();

    for (mention in mentions) {
      if (mentions[mention].name == val[1]) {
        deleteMentionFromDB(mentions[mention]);
        mentions.splice(mention, 1);
        var msg = val[1] + " mention is gone. Don't worry though if did this by mistake you can't undo it.. oh wait.. worry on.";
        callback(true, msg, []);
        return msg;
      }
    }

    callback(true, "No such mention.", []);
    return msg;
  }
}


function editMention(request, bots, isMod, callback) {
  var regex = /^\/mention edit (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

    if (!isMod) {
      var msg = "You don't have permission to edit custom mentions"
      callback(true, msg, []);
      return msg;
    }

    for (loc in request.attachments[0].loci) {
      request.attachments[0].loci[loc][0] -= 15 + val[1].length;
    }
    val[1] = val[1].toLowerCase();
    for (mention in mentions) {
      if (mentions[mention].name == val[1]) {
        mentions[mention].message = val[2];
        mentions[mention].attachments = request.attachments;
        changeMsgMentionDB(mentions[mention]);

        var msg = val[1] + " message updated.";
        callback(true, msg, []);
        return msg;
      }
    }

    var msg = val[1] + " doesn't exist";
    callback(true, msg, []);
    return msg;
  }
}