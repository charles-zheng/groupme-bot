#What is Groupme Bot?

A bot built in Node.js that utilizes Groupme's API to create an interactivve bot that lives in 1 or more groupme rooms. It is based on https://github.com/groupme/bot-tutorial-nodejs

#Setting up your own Groupme bot

* You can host your Groupme bot where ever it's convienent for you. If you're not sure, I suggest using [Openshift](https://www.openshift.com). I have a video tutorial showing how to get your own bot setup using [Openshift](https://www.openshift.com) [Right Here](https://youtu.be/8wh_TRPCEsQ).
* Create a new group on groupme and DON'T ADD ANYONE
* After you have the bot hosted and running you need to create a bot at [https://dev.groupme.com/bots](https://dev.groupme.com/bots).
    * Click create bot
    * Select the new empty room you just created
    * Give the bot a name
    * You can choose an avatar for your bot by putting in the url of a picture
    * Use the base URL/bot/config for the Callback URL. For example http://nodejs-mybot.openshift.com/bot/config.
    * After you save your bot's configuration, copy the Bot ID
    * In the group you created for your bot send a message with: /config Bot ID. EX: /config dV82tx6bA6cstUZX7ghY7aho3y
    * Your bot will listen to room configuration commands in this group only and has saved your information as the bot owner.

Congratulations! Your new Groupme Bot is up and running! You can now type "/commands" in the direct message with your bot for a list of commands.

#Default Commands and Examples
* /mod add <nickname> <@mods name in chat> EX: /mod add fo0 @fo0
* /mod remove <nickname> EX: /mod remove fo0
* /cmd add <cmd> <response> EX: /cmd add ping pong
* /cmd edit <cmd> <new_response> EX: /cmd add ping don't ping me anymore
* /cmd describe <cmd> <description> EX: /cmd describe ping responds with pong
* /cmd remove <cmd> EX: /cmd remove ping
* /mention add <mention_name> <message_with_mods_@'d> EX: /mention add mods Hey mods I need help. @jim @jack @jill
* /mention edit <mention_name> <new_message> EX: /mention edit mods Just trying to annoy you mods. @jim @jack
* /mention describe <mention_name> <description> EX: /mention describe mods Pings all the mods
* /mention remove <mention_name> EX: /mention remove mods

#ToDo:
* Make the index.js validate that the request is originating from groupme
* Have a list of protected commands from the modules / custom modules that can't be over ridden with user added commands
