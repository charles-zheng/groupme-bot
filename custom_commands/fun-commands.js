var cmds = [];

exports.checkCommands = function(dataHash, callback) {
  for (cmd in cmds) {

  }
}

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "/flipcoin", desc: "Returns heads or tails 50/50 chance", fun: true},
    {cmd: "/rolldice", desc: "Will simulate a random dice roll", fun: true}
  ];

  return cmdArr;
}

function cmdFlipCoin(request){
  var regex = /^\/flipcoin$/i;


}

function cmdRollDice(request){
  var regex = /^\/rolldice/i;


}