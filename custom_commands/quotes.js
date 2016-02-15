cmds = [cmdSaveQuote, cmdRandomQuote];

exports.checkCommands = function(dataHash, callBack){
  for (cmd in cmds) {
    test = cmds[cmd](dataHash.request);
    if (test)
      if (!dataHash.funMode){
        callback(true, "Sorry I'm no fun right now", []);
        return test;
      }
      callback(true, 'coming soon', []);
      return test;
  }
}

function cmdSaveQuote(request) {
  regex = /^\/quote save ([\s\S]+)/i;

  if (regex.test(request.text)){
    return true;
  } else {
    return false;
  }
}

function cmdRandomQuote(request) {
  regex = /^\/quote (.+_)/i;

  if (regex.test(request.text)){
    return true;
  } else {
    return false;
  }
}