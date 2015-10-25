var HTTPS = require('https');
var debug = process.env.DEBUG || false;

var raBotID  = process.env.RA_BOT_ID;
var rawBotID = process.env.RAW_BOT_ID;
var fo0BotID = process.env.FO0_BOT_ID;

var delayTime = 1000;

function respond() {
  var request   = JSON.parse(this.req.chunks[0]),
    newMember   = / added /,
    leader      = /@leaders/i,
    troll       = /@troll/i,
    gif         = /^\/gif (.+)/i;

  this.res.writeHead(200);
  this.res.end();

  var botID = '';

  if (this.req.url.toLowerCase() == "/ra") {
    botID = raBotID;
  } else if (this.req.url.toLowerCase() == "/raw") {
    botID = rawBotID;
  } else if (this.req.url.toLowerCase() == "/fo0") {
    botID = fo0BotID;
  }

  if(debug && typeof(request.attachments[0]) !== 'undefined') {
    console.log(request.attachments[0]);
    console.log(request.attachments[0].loci);
    console.log(request.attachments[0].user_ids);
  }

  if(request.system) {
    if(request.text && newMember.test(request.text)) {
      var message = '';

      if (botID == raBotID) {
        message = "Welcome to Reddit Asylum! This is our social chat. Please change your name to match your IGN. If you haven't already, make sure to read our rules available at https://www.reddit.com/r/RedditAsylumCoC/wiki/index."
      } else if (botID == rawBotID) {
        message = "Welcome to Reddit Asylum! This is our war chat. Please change your name to match your IGN. We use this room for posting and discussing war attack strategies."
      }
      setTimeout(postMessage(message, [], botID), delayTime);
    }
  } else if (request.text && leader.test(request.text)) {
    setTimeout(function() {
      postMessage("Hey leaders you're being paged! [@GusGus @Michael @Lee1104 @Ryan @JLU @Fowla @Champ @Wiiii @Blareposeidon2082 @Bucket @419GottaMinute @SonOfGusGus (Asylum)]",
                [
                  {
                    loci: [ [33, 7], [41, 8], [50, 8], [59, 5], [65, 4], [70, 6],
                            [77, 6], [84, 6], [91, 18], [110, 7], [118, 15], [134, 21] ],
                    type: 'mentions',
                    user_ids: ['15032435', '26027141', '22092647', '11713960',
                               '24727461', '25070550', '19112175', '12076411',
                               '23434057', '27333432', '19571350', '25478014']
                  }
                ], botID);
    }, delayTime);
  } else if (request.text && troll.test(request.text)) {
    setTimeout(function() {
      postMessage("Troll you're being summoned [@SonOfGusGus (Asylum)]",
                [
                  {
                    loci: [ [29, 21] ],
                    type: 'mentions',
                    user_ids: [ '25478014' ]
                  }
                ], botID);
    }, delayTime);
  } else if (request.text && gif.test(request.text)) {
    var res = gif.exec(request.text)

    var options = {
      hostname: 'api.giphy.com',
      path: '/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + encodeURIComponent(res[1])
    };

    callback = function(response) {
      str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });
      response.on('end', function() {
        str = JSON.parse(str);
        if (typeof(str.data.image_original_url) !== 'undefined') {
          msg = str.data.image_original_url;
        } else {
          msg = "There's no such GIFs silly";
        }
        setTimeout(function() {
          postMessage(msg, [], botID);
        }, delayTime);
      });
    };

    HTTPS.request(options, callback).end();
  }
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