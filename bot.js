//load modules
var sysCommands = require('./modules/sys-commands.js');
var db          = require('./modules/db.js');
var mods        = require('./modules/mods.js');

//commands with custom actions
var triggers    = require('./custom_commands/user-commands.js');
var sysTriggers = require('./custom_commands/system-triggers.js');
var quotes      = require('./custom_commands/quotes.js');

//load config
var config      = require('./config/config.js');
var HTTPS       = require('https');

function getBot(path) {
  var bot = {};
  path = path.toLowerCase();

  if (config.bots[path]) {
    bot.type = path;
    bot.id = config.bots[path];
  }

  return bot;
}

//goal is to create a standard way to consume the command modules
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

  //figure out a way to make the callback params generic, maybe just another datahash
  mods.checkCommands(dataHash, function(check, result){
    if (check) sendDelayedMessage(result, [], dataHash.currentBot.id);
  });

  //make an api only module. this idea was interesting but confusing for the average user. also not easy to implement via GME chat
  triggers.checkCommands(dataHash, function(check, api, result, attachments){
    if (check){
      if (api) {
        apiRequest(result.apiHost, result.apiPath, trigger.val, result.message, result.failMessage, function(msg) {
          sendDelayedMessage(msg, result.attachments, dataHash.currentBot.id);
        });
      } else {
        sendDelayedMessage(result, attachments, dataHash.currentBot.id);
      }
    }
  });

  //refactor syscommands into a callback that mirros triggers and mods commands checks.
  sysCommands.checkCommands(dataHash, function(check, result){
    if (check) sendDelayedMessage(result, [], dataHash.currentBot.id);
  });
}

exports.commands = function() {
  console.log('displaying commands at /commands');
  commandsStr = "<html>"

  commandsStr += triggers.getHTML();

  commandsStr += "</html>";
  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(commandsStr);
}

function sendDelayedMessage(msg, attachments, botID) {
  setTimeout(function() {
    postMessage(msg, attachments, botID);
  }, config.delay_time);
}

function apiRequest(host, path, input, returnProperty, failMsg, apiCallback) {
  path = path.replace("$$1", encodeURIComponent(input));

  var options = {
    hostname: host,
    path: path
  };
  props = returnProperty.split('.');

  callback = function(response) {
    str = '';

    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      str = JSON.parse(str);
      msg = str;

      for (prop in props) {
        if (typeof(msg[props[prop]]) !== 'undefined') {
          msg = msg[props[prop]];
        } else {
          msg = failMsg;
        }
      }

      apiCallback(msg);
    });
  };

  HTTPS.request(options, callback).end();
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