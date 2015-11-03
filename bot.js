//load modules
var sysCommands = require('./modules/sys-commands.js');
var db          = require('./modules/db.js');
var mods        = require('./modules/mods.js');

var config      = require('./config/config.js');
var HTTPS       = require('https');

//bot variables
var triggers, mods;
//['30802922', '25478014', '15032435', '27333432', '26027141', '19112175', '12076411', '11713960'];

function getTriggers() {
  db.getTriggers(function(res){
    triggers = res;
  });
}

function getMods() {
  db.getMods(function(res){
    mods.setMods(res);
  });
}

getTriggers();
getMods();

function getBot(path) {
  var bot = {};
  var key = path.substring(1, path.length);

  if (config.bots[key]) {
    bot.type = key;
    bot.id = config.bots[key];
  }

  return bot;
}

function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  var currentBot = getBot(this.req.url.toLowerCase());

  this.res.writeHead(200);
  this.res.end();
  if (request.sender_type == 'bot') {
    return;
  }

  mods.checkModCommands(request, config.bot_owner, function(check, result){
    if (check)
      sendDelayedMessage(result, [], currentBot.id);
  });

  var checkSys = sysCommands.checkSysCommands(request, triggers);

  if (checkSys) {
    if (!mods.isMod(request.user_id)) {
      sendDelayedMessage("You're not the boss of me", [], currentBot.id);
      return;
    }

    sendDelayedMessage(checkSys, [], currentBot.id);
  } else {
    for (var trigger in triggers) {
      trigger = triggers[trigger];

      if ((trigger.system && request.system) || (!trigger.system && !request.system)) {
        var triggerReg = new RegExp(trigger.regex, "i");
        if (trigger.bots.indexOf(currentBot.type) > -1 && request.text && triggerReg.test(request.text)){
          var val = triggerReg.exec(request.text);

          if (!sysCommands.fun_mode() && trigger.fun){
            sendDelayedMessage("Sorry I'm no fun right now.", [], currentBot.id);
          } else if (trigger.apiHost && trigger.apiPath) {
            apiRequest(trigger.apiHost, trigger.apiPath, val[1], trigger.message, trigger.failMessage, function(msg) {
              sendDelayedMessage(msg, trigger.attachments, currentBot.id);
            });
          } else {
            var msg = messageTokenReplace(trigger, val);
            sendDelayedMessage(msg, trigger.attachments, currentBot.id);
          }
          break;
        }
      }
    }
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