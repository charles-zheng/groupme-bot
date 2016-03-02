var mentions;
var userMentions = [addMention, describeMention, editMention, removeMention];

var db = require('../modules/db.js');
var db_table = 'user_mentions';

getAllMentions();
exports.modName = "Custom Mentions";

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

function editMentionDB(mention, callback) {
  var updateHash = {
    $set: {
      "message": mention["message"],
      "attachments": mention["attachments"]
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

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "/mention add 'name' 'message with tags'", desc: "Add a new custom mention", mod: true},
    {cmd: "/mention describe 'name' 'description'", desc: "Adds a description to a custom mention for this command list", mod: true},
    {cmd: "/mention edit 'name' 'message with tags'", desc: "Changes the response of an existing mention", mod: true},
    {cmd: "/mention remove 'name'", desc: "Deletes a custom mention", mod: true}
  ];

  for (mention in mentions) {
    cmdArr.push({cmd: "@" + mentions[mention].name, desc: mentions[mention].description});
  }

  return cmdArr;
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
        var msg = val[1] + " mention is gone. Don't worry though if you did this by mistake you can't undo it.. oh wait.. worry on.";
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
        editMentionDB(mentions[mention]);

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