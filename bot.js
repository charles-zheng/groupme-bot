/*global init*/

//load modules
var sysCommands  = require('./modules/sys-commands.js');
var db           = require('./modules/db.js');
var mods         = require('./modules/mods.js');
var commandList  = require('./modules/command-list.js');
var rooms        = require('./modules/rooms.js');

//commands with custom actions
var userCmds     = require('./custom_commands/user-commands.js');
var userMentions = require('./custom_commands/user-mentions.js');
var sysTriggers  = require('./custom_commands/system-triggers.js');
var quotes       = require('./custom_commands/quotes.js');
var atEveryone   = require('./custom_commands/at-everyone.js');
var funCommands  = require('./custom_commands/fun-commands.js');
var gif          = require('./custom_commands/giphy-api.js');
var catFact      = require('./custom_commands/cat-fact.js');
var urbanDict    = require('./custom_commands/urban-dictionary.js');

//load config
var config       = require('./config/config.js');
var HTTPS        = require('https');

//Temporarily just an array of the commands functions. Make an object with configuration values.
var checkCommandsHSH = [mods, sysTriggers, userCmds, userMentions, sysCommands, atEveryone, funCommands, quotes, rooms, gif, catFact, urbanDict];

exports.init = function() {
  var req = this.req;
  init.initPage(req, function(body){
    this.res.writeHead(200, {"Content-Type": "text/html"});
    this.res.end(body);
  });
}

exports.respond = function(botRoom) {
  var request = JSON.parse(this.req.chunks[0]);

  var dataHash = {
    request:      request,
    currentBot:   rooms.getRoom(botRoom),
    isMod:        mods.isMod(request.user_id),
    bots:         rooms.getRooms(),
    funMode:      sysCommands.fun_mode(),
    owner:        config.env().owner
  };

  this.res.writeHead(200);
  this.res.end();

  if (dataHash.request.sender_type == 'bot') return;
  dataHash.request.text = dataHash.request.text.trim();

  if (!rooms.getRoom(botRoom).id && botRoom != 'config')
    return;

  for(var lib in checkCommandsHSH) {
    checkCommandsHSH[lib].checkCommands(dataHash, function(check, result, attachments){
      if (check) sendDelayedMessage(result, attachments, rooms.getRoom(botRoom).id);
    });
  }
}

exports.commands = function() {
  var cmdArr = [];

  console.log('displaying commands at /commands');

  for(var lib in checkCommandsHSH){
    var newCmds = checkCommandsHSH[lib].getCmdListDescription();
    if (newCmds)
      cmdArr = cmdArr.concat(newCmds);
  }

  var output = commandList.buildHTML(cmdArr, config.bot_name);

  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(output);
}

function sendDelayedMessage(msg, attachments, botID) {
  setTimeout(function() {
    postMessage(msg, attachments, botID);
  }, config.delay_time);
}

function postMessage(botResponse, attachments, botID) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "attachments" : attachments,
    "bot_id"      : botID,
    "text"        : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if (res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}