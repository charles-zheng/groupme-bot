var HTTPS = require('https');
var db    = require('./db.js');

var debug = process.env.DEBUG || false;

var raBotID  = process.env.RA_BOT_ID;
var rawBotID = process.env.RAW_BOT_ID;
var fo0BotID = process.env.FO0_BOT_ID;

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
      bot.type = 'fo0'
      bot.id = fo0BotID;
      break;
  }

  return bot;
}

function respond() {
  var request = JSON.parse(this.req.chunks[0]);

  var currentBot = getBot(this.req.url.toLowerCase());

  this.res.writeHead(200);
  this.res.end();

  for (var trigger in triggers) {
    trigger = triggers[trigger];
    if((trigger.system && request.system) || (!trigger.system && !request.system)){
      var triggerReg = new RegExp(trigger.regex, "i");
      if (trigger.bots.indexOf(currentBot.type) > -1 && request.text && triggerReg.test(request.text)){
        if(trigger.apiHost && trigger.apiPath) {
          val = triggerReg.exec(request.text);
          apiRequest(trigger.apiHost, trigger.apiPath, val[1], trigger.message, trigger.failMessage, currentBot.id);
        } else {
          setTimeout(function() {
            postMessage(trigger.message, trigger.attachments, currentBot.id);
          }, delayTime);
          break;
        }
      }
    }
  }
}

function apiRequest(host, path, input, returnProperty, failMsg, botID) {
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

      setTimeout(function() {
        postMessage(msg, [], botID);
      }, delayTime);
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