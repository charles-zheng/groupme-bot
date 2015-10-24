var HTTPS = require('https');
var debug = process.env.DEBUG || false;
var botID = process.env.BOT_ID;

function respond() {
  var request   = JSON.parse(this.req.chunks[0]),
      newMember = / added /,
      leader    = /^@leaders$/;
      troll     = /^@troll$/;

  this.res.writeHead(200);
  this.res.end();


  if(debug && typeof(request.attachments[0]) !== 'undefined') {
    console.log(request);
    console.log(request.attachments[0].loci);
    console.log(request.attachments[0].user_ids);
  }

  if(request.system) {
    if(request.text && newMember.test(request.text)) {
      setTimeout(postMessage("Welcome to Reddit Asylum! This is our social chat. Please change your name to match your IGN. If you haven't already, make sure to read our rules available at https://www.reddit.com/r/RedditAsylumCoC/wiki/index.", []), 3000);
    }
  } else if (request.text && leader.test(request.text)) {
    setTimeout(postMessage("Hey leaders you're being paged! [@GusGus @Michael @Lee1104 @Ryan @JLU @Fowla @Champ @Wiiii @Blareposeidon2082 @Bucket @419GottaMinute]",
                [
                  {
                    loci: [ [33, 7], [41, 8], [50, 8], [59, 5], [65, 4], [70, 6],
                            [77, 6], [84, 6], [91, 18], [110, 7], [118, 15] ],
                    type: 'mentions',
                    user_ids: ['15032435', '26027141', '22092647', '11713960',
                               '24727461', '25070550', '19112175', '12076411',
                               '23434057', '27333432', '19571350']
                  }
                ]), 1000);
  } else if (request.text && troll.test(request.text)) {
    setTimeout(postMessage("Troll you're being summoned [@SonOfGusGus (Asylum)]",
                [
                  {
                    loci: [ [29, 20] ],
                    type: 'mentions',
                    user_ids: [ '25478014' ]
                  }
                ]), 1000);
  }
}

function postMessage(botResponse, attachments) {
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