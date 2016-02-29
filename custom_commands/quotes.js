var db = require('../modules/db.js');

db_table = 'user_quotes';

cmds = [cmdSaveQuote, cmdRandomQuote, cmdRandomUserQuote];

function saveQuote(quoteHash, callback){
  db.addDoc(db_table, quoteHash, callback);
}

function findQuotes(id, callback){
  db.findDocs(db_table, {user_id: id}, callback);
}

function countQuotes(callback){
  db.countDocs(db_table, callback);
}

function getOneRandomQuote(callback){
  db.randomDoc(db_table, callback);
}

exports.checkCommands = function(dataHash, callBack){
  for (cmd in cmds) {
    test = cmds[cmd](dataHash.request, function(msg){
      if (!dataHash.funMode){
        callback(true, "Sorry I'm no fun right now", []);
      }
      callBack(true, msg, []);
    });

    if (test)
      return test;
  }
}

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "/quote save @user 'quote text'", desc: "Save a quote from a user", fun: true},
    {cmd: "/quote @user", desc: "Shares a random quote that's been saved from the user", fun: true},
    {cmd: "/quote", desc: "Shares a random quote from all of the saved quotes", fun: true}
  ];

  return cmdArr;
}

function cmdSaveQuote(request, callback) {
  regex = /^\/quote save ([\s\S]+)/i;

  if (regex.test(request.text)){
    var val = regex.exec(request.text);
    var msg = "";

    if (!request.attachments[0].user_ids) {
      msg = "You have to @user for the person you're trying to quote.";
    } else if (!request.attachments[0].loci[0][1] == 12) {
      msg = "Please @the person you're quoting before their message. EX: /quote save @user this is their quote";
    } else if (request.attachments[0].user_ids.length > 1) {
      msg = "You can only quote 1 user at a time.";
    } else if (val[1].length <= request.attachments[0].loci[0][1]){
      msg = "... You want to quote their silence?";
    } else {
      var user_id = request.attachments[0].user_ids[0];

      var start = request.attachments[0].loci[0][0];
      var end = start + request.attachments[0].loci[0][1];
      var user_name = request.text.substring(start, end);

      var quote = request.text.substring(end, request.text.length);
      quote = quote.trim();


      var date = new Date();
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
      date = year + "-" + month + "-" + day;
      var quoteHash = {
        user_id: user_id,
        user_name: user_name,
        quote: quote,
        date: date
      }

      saveQuote(quoteHash);
      msg = "Quote saved!";
    }
    callback(msg);
    return msg;
  } else {
    return false;
  }
}

function cmdRandomUserQuote(request, callback) {
  regex = /^\/quote (.+)/i;

  if (regex.test(request.text)){
    if (!request.attachments[0].user_ids)
      return "You have to @user for the person you're trying to quote.";

    findQuotes(request.attachments[0].user_ids[0], function(docs){
      if (docs.length > 0){
        var rnd = Math.floor(Math.random() * docs.length);
        msg = '"' + docs[rnd].quote + '" - ' + docs[rnd].date;
        callback(msg);
      }
    });
    return true;
  } else {
    return false;
  }
}

function cmdRandomQuote(request, callback) {
  regex = /^\/quote$/i;

  if (regex.test(request.text)){
    getOneRandomQuote(function(docs){
      msg = docs.user_name + ': "' + docs.quote + '" - ' + docs.date;
      callback(msg);
    });
    return true;
  } else {
    return false;
  }
}