//load modules
var sysCommands  = require('./modules/sys-commands.js');
var db           = require('./modules/db.js');
var mods         = require('./modules/mods.js');
var commandList  = require('./modules/command-list.js');
var init         = require('./modules/init.js');

//commands with custom actions
var userCmds     = require('./custom_commands/user-commands.js');
var userMentions = require('./custom_commands/user-mentions.js');
var sysTriggers  = require('./custom_commands/system-triggers.js');
var quotes       = require('./custom_commands/quotes.js');
var apiTriggers  = require('./custom_commands/json-api-cmds.js');
var atEveryone   = require('./custom_commands/at-everyone.js');
var funCommands  = require('./custom_commands/fun-commands.js');
var quotes       = require('./custom_commands/quotes.js');

//load config
var config       = require('./config/config.js');
var HTTPS        = require('https');

//Temporarily just an array of the commands functions. Make an object with configuration values.
var checkCommandsHSH = [mods, sysTriggers, apiTriggers, userCmds, userMentions, sysCommands, atEveryone, funCommands, quotes];

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
    currentBot:   getBot(botRoom),
    isMod:        mods.isMod(request.user_id),
    bots:         config.bots,
    funMode:      sysCommands.fun_mode(),
    owner:        config.bot_owner
  };

  this.res.writeHead(200);
  this.res.end();

  if (dataHash.request.sender_type == 'bot') return;
  dataHash.request.text = dataHash.request.text.trim();

  for(lib in checkCommandsHSH) {
    checkCommandsHSH[lib].checkCommands(dataHash, function(check, result, attachments){
      if (check) sendDelayedMessage(result, attachments, dataHash.currentBot.id);
    });
  }
}

exports.commands = function() {
  var cmdArr = [];

  console.log('displaying commands at /commands');

  for(lib in checkCommandsHSH){
    var newCmds = checkCommandsHSH[lib].getCmdListDescription();
    if (newCmds)
      cmdArr = cmdArr.concat(newCmds);
  }

  var output = commandList.buildHTML(cmdArr, config);

  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(output);
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