var mainHTML, allHTML, modHTML, ownerHTML;
var fs = require('fs');

init();

function init() {
  getFileAll('commands/command.html', function(data) {
    mainHTML = data;
  });
  getFileAll('commands/partials/_all.html', function(data) {
    allHTML = data;
  });
  getFileAll('commands/partials/_mod.html', function(data) {
    modHTML = data;
  });
  getFileAll('commands/partials/_owner.html', function(data) {
    ownerHTML = data;
  });
}

//feels pointless, come up with a better way to do this
function getFileAll(path, callback) {
  fs.readFile(path, 'utf8', function(err, data){
    callback(data);
  });
}

exports.buildHTML = function (cmdArray, bot_name) {
  var modArr   = [];
  var ownerArr = [];
  var allArr   = [];

  cmdArray.sort(function(a, b) {
    if (a.cmd < b.cmd)
      return - 1;
    else if (a.cmd > b.cmd)
      return 1;
    else
      return 0;
  });

  for (cmd in cmdArray) {
    if (!cmdArray[cmd].desc)
      cmdArray[cmd].desc = "No description provided ... thanks lazy mods";

    if (cmdArray[cmd].owner)
      ownerArr.push(cmdArray[cmd]);
    else if (cmdArray[cmd].mod)
      modArr.push(cmdArray[cmd]);
    else
      allArr.push(cmdArray[cmd]);
  }

  //put this repetitive code in a function ... you're better than this
  var allBuiltHTML   = '';
  var modBuiltHTML   = '';
  var ownerBuiltHTML = '';

  for (cmd in allArr) {
    var addHTML = allHTML.replace('$$command_name', allArr[cmd].cmd);
    addHTML = addHTML.replace('$$command_desc', allArr[cmd].desc);
    allBuiltHTML += addHTML;
  }

  for (cmd in modArr) {
    var addHTML = modHTML.replace('$$command_name', modArr[cmd].cmd);
    addHTML = addHTML.replace('$$command_desc', modArr[cmd].desc);
    modBuiltHTML += addHTML;
  }

  for (cmd in ownerArr) {
    var addHTML = ownerHTML.replace('$$command_name', ownerArr[cmd].cmd);
    addHTML = addHTML.replace('$$command_desc', ownerArr[cmd].desc);
    ownerBuiltHTML += addHTML;
  }

  var mainBuiltHTML = mainHTML;
  mainBuiltHTML = mainBuiltHTML.replace('$$bot_name', bot_name);
  mainBuiltHTML = mainBuiltHTML.replace('$$all', allBuiltHTML);
  mainBuiltHTML = mainBuiltHTML.replace('$$mod', modBuiltHTML);
  mainBuiltHTML = mainBuiltHTML.replace('$$owner', ownerBuiltHTML);

  return mainBuiltHTML;
}