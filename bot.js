  /*gif: {
    regex: /^\/gif (.+)/i,
    system: false,
    bots: ['ra', 'fo0'],
    message: 'data.image_original_url',
    failMessage: "There's no such gif silly",
    attachments: [],
    apiHost: 'api.giphy.com',
    apiPath: '/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=$$1'
  }
}; */

var HTTPS = require('https');
var db    = require('./db.js');

var debug = process.env.DEBUG || false;

var raBotID  = process.env.RA_BOT_ID;
var rawBotID = process.env.RAW_BOT_ID;
var ralBotID = process.env.RAL_BOT_ID;
var fo0BotID = process.env.FO0_BOT_ID;
var ralvBotId = process.env.RALV_BOT_ID;

var delayTime = 1000;

var triggers = '';

db.getTriggers(function(res){
  triggers = res;
});

function getBot(path) {
  var bot = {};

  switch(path){
    case "/ra":
      bot.type = 'ra';
      bot.id = raBotID;
      break;
    case "/raw":
      bot.type = 'raw';
      bot.id = rawBotID;
      break;
    case "/fo0":
      bot.type = 'fo0';
      bot.id = fo0BotID;
      break;
    case "/ral":
      bot.type = 'ral';
      bot.id = ralBotID;
      break;
    case "/ralv":
      bot.type = 'ralv';
      bot.id = ralvBotId;
      break;
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

  for (var trigger in triggers) {
    trigger = triggers[trigger];
    if((trigger.system && request.system) || (!trigger.system && !request.system)){
      var triggerReg = new RegExp(trigger.regex, "i");
      if (trigger.bots.indexOf(currentBot.type) > -1 && request.text && triggerReg.test(request.text)){
        var val = triggerReg.exec(request.text);
        if(trigger.apiHost && trigger.apiPath) {
          apiRequest(trigger.apiHost, trigger.apiPath, val[1], trigger.message, trigger.failMessage, function() {
            sendDelayedMessage(trigger.message, trigger.attachments, currentBot.id);
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

function messageTokenReplace(trigger, val) {
  var str = trigger.message;
  var details = '';

  //get trigger names
  var names = '';
  for (trig in triggers) {
    names += triggers[trig].name + ', ';
    if (triggers[trig].name == val[1])
      details = triggers[trig];
  }
  names = names.substring(0, names.length - 2);
  str = str.replace('$triggers.name', names);

  //insert trigger document
  if (trigger.name == "details") {
    details = JSON.stringify(details);
    details = details.replace(/,/g, ',\n');
    str = str.replace('$$1', details);
    str = str.replace('$$1', 'command not found');
  }

  return str;
}

function sendDelayedMessage(msg, attachments, botID) {
  setTimeout(function() {
    postMessage(msg, attachments, botID);
  }, delayTime);
}

function apiRequest(host, path, input, returnProperty, failMsg, callback) {
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
        if(typeof(msg[props[prop]]) !== 'undefined') {
          msg = msg[props[prop]];
        } else {
          msg = failMsg;
        }
      }
      callback(msg);
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
      if(res.statusCode == 202) {
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