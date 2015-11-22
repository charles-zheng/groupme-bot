//load modules
var sysCommands = require('./modules/sys-commands.js');
var db          = require('./modules/db.js');
var mods        = require('./modules/mods.js');
var triggers    = require('./modules/triggers.js');
var config      = require('./config/config.js');
var HTTPS       = require('https');

function getTriggers() {
  db.getTriggers(function(res){
    triggers.setTriggers(res);
  });
}

function getMods() {
  db.getMods(function(res){
    mods.setMods(res);
  });
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

getTriggers();
getMods();

function respond(botRoom) {
  var request = JSON.parse(this.req.chunks[0]);
  var currentBot = getBot(botRoom);
  var isMod = mods.isMod(request.user_id);
  var bots = config.bots;
  var fun_mode = sysCommands.fun_mode();

  this.res.writeHead(200);
  this.res.end();
  if (request.sender_type == 'bot') {
    return;
  }

  mods.checkModCommands(request, config.bot_owner, function(check, result){
    if (check)
      sendDelayedMessage(result, [], currentBot.id);
  });

  triggers.checkTriggerCommands(request, currentBot, fun_mode, bots, isMod, function(check, api, result, attachments){
    if (check){
      if (api) {
        apiRequest(result.apiHost, result.apiPath, trigger.val, result.message, result.failMessage, function(msg) {
          sendDelayedMessage(msg, result.attachments, currentBot.id);
        });
      } else {
        sendDelayedMessage(result, attachments, currentBot.id);
      }
    }
  });

  var checkSys = sysCommands.checkSysCommands(request, triggers.getTriggers());

  if (checkSys) {
    if (!isMod) {
      sendDelayedMessage("You're not the boss of me", [], currentBot.id);
      return;
    }

    sendDelayedMessage(checkSys, [], currentBot.id);
  }
}

function messageTokenReplace(trigger, val) {
  var str = trigger.message;

  return str;
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

function commands() {
  console.log('displaying commands at /commands');
  commandsStr = "<html>"
  //compile custom trigger names
  commandsStr += triggers.getTriggersHTML();

  commandsStr += "</html>";
  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(commandsStr);
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

exports.respond = respond;
exports.commands = commands;