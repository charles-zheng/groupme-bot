var sysCommands = [triggersCmd, detailCmd];

function checkSysCommands(request, triggers) {
  for(command in sysCommands) {
    var test = sysCommands[command](request, triggers);
    if (test)
      return test;
  }

  return false;
}

function triggersCmd(request, triggers) {
  var regex = /^\/triggers$/i;

  if(regex.test(request.text)) {
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

  if(regex.test(request.text)) {
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