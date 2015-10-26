var HTTPS = require('https');
var debug = process.env.DEBUG || false;

var raBotID  = process.env.RA_BOT_ID;
var rawBotID = process.env.RAW_BOT_ID;
var fo0BotID = process.env.FO0_BOT_ID;

var delayTime = 1000;

var triggers = {
  newMemberRa: {
    regex: / added /,
    system: true,
    bots: ['ra', 'fo0'],
    message: "Welcome to Reddit Asylum! This is our social chat. Please change your name to match your IGN. If you haven't already, make sure to read our rules available at https://www.reddit.com/r/RedditAsylumCoC/wiki/index.",
    attachments: []
  },
  newMemberRaw: {
    regex: / added /,
    system: true,
    bots: ['raw'],
    message: "Welcome to Reddit Asylum! This is our war chat. Please change your name to match your IGN. We use this room for posting and discussing war attack strategies.",
    attachments: []
  },
  zapquakechart: {
    regex: /^\/zapquakechart$/i,
    system: false,
    bots: ['ra', 'raw', 'fo0'],
    message: 'https://i.imgur.com/NMuCEB1.jpg',
    attachments: []
  },
  test: {
    regex: /^\/test$/i,
    system: false,
    bots: ['fo0'],
    message: '',
    attachements: [{
                    loci: [[0, 0]],
                    type: 'mentions',
                    user_ids: ['30802922']
                  }]
  },
  leader: {
    regex: /@leaders/i,
    system: false,
    bots: ['ra', 'raw', 'fo0'],
    message: "Hey leaders you're being paged! [@GusGus @Michael @Lee1104 @Ryan @JLU @Fowla @Champ @Wiiii @Blareposeidon2082 @Bucket @419GottaMinute @SonOfGusGus (Asylum)]",
    attachments: [{
                   loci: [[33, 7], [41, 8], [50, 8], [59, 5], [65, 4], [70, 6],
                          [77, 6], [84, 6], [91, 18], [110, 7], [118, 15],
                          [134, 21]],
                   type: 'mentions',
                   user_ids: ['15032435', '26027141', '22092647', '11713960',
                              '24727461', '25070550', '19112175', '12076411',
                              '23434057', '27333432', '19571350', '25478014']
                  }]
  },
  troll: {
    regex: /@troll/i,
    system: false,
    bots: ['ra', 'raw', 'fo0'],
    message: "Troll you're being summoned [@SonOfGusGus (Asylum)]",
    attachments: [{
                   loci: [ [29, 21] ],
                   type: 'mentions',
                   user_ids: [ '25478014' ]
                  }]
  },
  gif: {
    regex: /^\/gif (.+)/i,
    system: false,
    bots: ['ra', 'fo0'],
    message: 'data.image_original_url',
    failMessage: "There's no such gif silly",
    attachments: [],
    apiHost: 'api.giphy.com',
    apiPath: '/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=$$1'
  }
};

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
      if (trigger.bots.indexOf(currentBot.type) > -1 && request.text && trigger.regex.test(request.text)){
        if(trigger.apiHost && trigger.apiPath) {
          val = trigger.regex.exec(request.text);
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