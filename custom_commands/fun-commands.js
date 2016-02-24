var cmds = [cmdFlipCoin, cmdRollDice];

exports.checkCommands = function(dataHash, callback) {
  for (cmd in cmds) {
    var test = cmds[cmd](dataHash.request, callback);
    if (test) {
      if (!dataHash.funMode){
        callback(true, "Sorry I'm no fun right now", []);
        return test;
      }
      callback(true, test, []);
      return test;
    }
  }
}

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "/flipcoin", desc: "Returns heads or tails 50/50 chance", fun: true},
    {cmd: "/roll #d#", desc: "Will simulate a random dice roll of # number dice and # sides. EX: /roll 2d6 will roll two six sided dice.", fun: true}
  ];

  return cmdArr;
}

function cmdFlipCoin(request){
  var regex = /^\/flipcoin$/i;

  if (regex.test(request.text)) {
    var num = Math.floor((Math.random() * 2) + 1);
    var msg = "Heads!";
    if (num == 1) {
      msg = "Tails!";
    }

    return msg;
  } else {
    return false;
  }
}

function cmdRollDice(request){
  var regex = /^\/roll (\d+)d(\d+)/i;

  if (regex.test(request.text)) {
    var val = regex.exec(request.text);
    var msg = "";

    if (val[1] < 1) {
      msg = "Hey I rolled no dice and the result is ... You're an idiot";
    } else if (val[1] > 20) {
      msg = "If I can't fit more than 20 dice in my robot hand";
    } else if (val[2] > 1000) {
      msg = "I'm 3d printing dice with more than 1000 sides just for this silly request. I'll get back to you in 37 years.";
    } else if (val[2] < 2) {
      msg = "Your results are: Unicorns";
    } else {
      for (i = 0; i < val[1]; i++) {
        var die = Math.floor((Math.random() * val[2]) + 1);
        msg += " " + die;
      }
      msg = "Your results are:" + msg;
    }
    return msg;
  } else {
    return false;
  }
}