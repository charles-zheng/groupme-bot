A simple Node Group Me Bot. Based on https://github.com/groupme/bot-tutorial-nodejs

Requirements:
You will need to setup a bot and attach it to your groupme group. You can do that at https://dev.groupme.com/bots.

You then need to setup an evironment variable with your bot's ID. If you're hosting it at openshift.com (recommended) you should install their command line tool and use the command:

 `rhc env set <Variable>=<Value> <Variable2>=<Value2> -a App_Name`

 You'll have to add openshift as a remote to be able to deploy to openshift.
