var fun_mode = true;
var sysCommands = [funCmd, noFunCmd];

exports.checkCommands = function(dataHash, callback) {
  for (command in sysCommands) {
    var test = sysCommands[command](dataHash, callback);
    if (test)
      return test;
  }

  return false;
}

exports.fun_mode = function(){
  return fun_mode;
}

function funCmd(dataHash, callback) {
  var regex = /^\/fun$/;

  if (regex.test(dataHash.request.text)) {
    if (dataHash.isMod) {
      if (fun_mode) {
        callback(true, "I'm already as much fun as I can be!", []);
      } else {
        fun_mode = true;
        callback(true, "I'm fun again!", []);
      }
    } else {
      callback(true, "You're not the boss of me", []);
    }
  } else {
    return false;
  }
}

function noFunCmd(dataHash, callback) {
  var regex = /^\/nofun$/;

  if (regex.test(dataHash.request.text)) {
    if(dataHash.isMod) {
      if (!fun_mode) {
        callback(true, "I can't be any less fun right now.", []);
      } else {
        fun_mode = false;
        callback(true, "I'm no fun anymore!", []);
      }
    } else {
      callback(true, "You're not the boss of me", []);
    }
  } else {
    return false;
  }
}