var fun_mode = true;
var sysCommands = [funCmd, noFunCmd, detailCmd];

exports.checkSysCommands = function(request, triggers, bots) {
  for (command in sysCommands) {
    var test = sysCommands[command](request, triggers, bots);
    if (test)
      return test;
  }

  return false;
}

exports.fun_mode = function(){
  return fun_mode;
}

function funCmd(request, triggers) {
  var regex = /^\/fun$/;

  if (regex.test(request.text)) {
    if (fun_mode) {
      return "I'm already as much fun as I can be!";
    } else {
      fun_mode = true;
      return "I'm fun again!";
    }
  } else {
    return false;
  }
}

function noFunCmd(request, triggers) {
  var regex = /^\/nofun$/;

  if (regex.test(request.text)) {
    if (!fun_mode) {
      return "I can't be any less fun right now.";
    } else {
      fun_mode = false;
      return "I'm no fun anymore!";
    }
  } else {
    return false;
  }
}

function detailCmd(request, triggers) {
  var regex = /^\/details (.+)/i;
  var details = null;

  if (regex.test(request.text)) {
    var val = regex.exec(request.text);

    for (trig in triggers) {
      if (triggers[trig].name == val[1])
        details = triggers[trig];
    }
    if (!details)
      return "Command " + val[1] + " not found";
    details = JSON.stringify(details);
    details = details.replace(/,/g, ',\n');
    return "The following triggers are currently active [" + details + "]";
  } else {
    return false;
  }
}