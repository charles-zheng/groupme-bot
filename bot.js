var HTTPS = require('https');
var debug = process.env.DEBUG || false;
var botID = process.env.BOT_ID;

function respond() {
  var request   = JSON.parse(this.req.chunks[0]),
      newMember = / added /,
      leader    = /^@leaders$/;

  this.res.writeHead(200);
  this.res.end();

  console.log(request) if debug;

  if(request.system) {
    if(request.text && newMember.test(request.text)) {
      postMessage("Welcome to Reddit Asylum! This is our social chat. Please change your name to match your IGN. If you haven't already, make sure to read our rules available at https://www.reddit.com/r/RedditAsylumCoC/wiki/index.");
    }
  } else if (request.text && leader.test(request.text)) {
    postMessage("@fo0 just testing");
  }
}

function postMessage(botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
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