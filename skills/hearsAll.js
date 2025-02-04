/*
WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

Add whatever you like, I could care less. Have fun!
*/

const log = require('../logger')('custom:hearsAll');
const wordfilter = require('wordfilter');

function hearsAll(controller) {
  const stats = {
    triggers: 0,
    convos: 0,
  };

  controller.on(['heard_trigger'], () => {
    stats.triggers++;
  });

  controller.on(['conversationStarted'], () => {
    stats.convos++;
  });

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* Utility function to format uptime */
  function formatUptime(uptime) {
    let unit = 'second';
    if (uptime > 60) {
      uptime /= 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime /= 60;
      unit = 'hour';
    }
    if (uptime != 1) {
      unit = `${unit}s`;
    }

    uptime = `${parseInt(uptime)} ${unit}`;
    return uptime;
  }

  controller.hears(['^uptime', '^debug'],['direct_message,direct_mention'], (bot, message) => {
    bot.createConversation(message, (err, convo) => {
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()));
        convo.setVar('convos', stats.convos);
        convo.setVar('triggers', stats.triggers);

        convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
        convo.activate();
      }
    });
  });

  controller.hears(['^say (.*)', '^say'],['direct_message,direct_mention'], (bot, message) => {
    if (message.match[1]) {
      if (!wordfilter.blacklisted(message.match[1])) {
        bot.reply(message, message.match[1]);
      } else {
        bot.reply(message, '_sigh_');
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.');
    }
  });

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~CUSTOM~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  controller.hears(['^do you like sand?'],['direct_message,direct_mention'], (bot, message) => {
    if (message.match[0]) {
      bot.reply(message, `I don't like sand. It's coarse, and rough, and irritating, and it gets everywhere.`);
    }
  });

  controller.hears(['^hello there'],['direct_message,direct_mention'], (bot, message) => {
    if (message.match[0]) {
      bot.reply(message, `https://media.giphy.com/media/Nx0rz3jtxtEre/giphy-downsized.gif`);
    }
  });
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~CUSTOM~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

};

function attachSkill(controller) {
  hearsAll(controller);
  log.verbose('ATTACHED');
};

module.exports = {
  hearsAll,
  attachSkill,
};
