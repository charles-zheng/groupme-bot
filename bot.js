//load modules
var sysCommands = require('./modules/sys-commands.js');
var db          = require('./modules/db.js');
var mods        = require('./modules/mods.js');

//commands with custom actions
var triggers    = require('./custom_commands/user-commands.js');
var sysTriggers = require('./custom_commands/system-triggers.js');
var quotes      = require('./custom_commands/quotes.js');
var apiTriggers = require('./custom_commands/json-api-cmds.js');

//load config
var config      = require('./config/config.js');
var HTTPS       = require('https');

//Temporarily just an array of the commands functions. Make an object with configuration values.
var checkCommandsHSH = [mods, sysTriggers, apiTriggers, triggers, sysCommands];

exports.respond = function(botRoom) {
  var request = JSON.parse(this.req.chunks[0]);

  var dataHash = {
    request:      request,
    currentBot:   getBot(botRoom),
    isMod:        mods.isMod(request.user_id),
    bots:         config.bots,
    funMode:      sysCommands.fun_mode(),
    owner:        config.bot_owner
  };

  this.res.writeHead(200);
  this.res.end();

  if (dataHash.request.sender_type == 'bot') return;

  for(lib in checkCommandsHSH) {
    checkCommandsHSH[lib].checkCommands(dataHash, function(check, result, attachments){
      if (check) sendDelayedMessage(result, attachments, dataHash.currentBot.id);
    });
  }
}

exports.commands = function() {
  console.log('displaying commands at /commands');
  commandsStr = "<html>"

  commandsStr += triggers.getHTML();

  commandsStr += "</html>";
  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(commandsStr);
}

function getBot(path) {
  var bot = {};
  path = path.toLowerCase();

  if (config.bots[path]) {
    bot.type = path;
    bot.id = config.bots[path];
  }

  return bot;
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