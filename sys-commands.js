var sysCommands = [funCmd, noFunCmd, triggersCmd, detailCmd];
//put this in the db later
var mods = ['30802922', '25478014', '15032435', '27333432', '26027141'];

function checkSysCommands(request, triggers) {

  for (command in sysCommands) {
    var test = sysCommands[command](request, triggers);
    if (test) {
      if (mods.indexOf(request.user_id) == -1){
        return "You're not the boss of me.";
      } else {
        return test;
      }
    }
  }

  return false;
}

function funCmd(request, triggers) {
  var regex = /^\/fun$/;

  if (regex.test(request.text)) {
    return "fun";
  } else {
    return false;
  }
}

function noFunCmd(request, triggers) {
  var regex = /^\/nofun$/;

  if (regex.test(request.text)) {
    return "nofun";
  } else {
    return false;
  }
}

function triggersCmd(request, triggers) {
  var regex = /^\/triggers$/i;

  if (regex.test(request.text)) {
    var names = '';
    for (trig in triggers) {
      names += triggers[trig].name + ', ';
    }

    return names.substring(0, names.length - 2);
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

exports.checkSysCommands = checkSysCommands;