require('dotenv').config();

if (!process.env.SLACK_TOKEN || !process.env.MONGODB_URI || !process.env.LOG_LEVEL || !process.env.TIMEZONE) {
  usage_tip();
  process.exit(1);
}

function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Standup Steve is present, but something is not working!');
  console.log('You are missing some .env vars...please check the README.md to check that you have everything you need!');
  console.log('~~~~~~~~~~');
}

const Botkit = require('botkit');
const debug = require('debug')('botkit:main');
const log = require('./logger')('app');
const bkLogger = require('./logger')('botkit');
const schedule = require('node-schedule');

function bkLog(level) {
  const args = [];
  for (let i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }

  if (level === 'debug') {
    return;
  }
  if (level === 'info') {
    level = 'verbose';
  } else if (level === 'notice') {
    level = 'info';
  }

  let fn; let
    thisObj;
  if (bkLogger[level]) {
    fn = bkLogger[level];
    thisObj = bkLogger;
  } else {
    fn = console.log;
    thisObj = console;
    args.unshift(`[${level}]`);
  }

  fn.apply(thisObj, args);
}

var controller = Botkit.slackbot({
  debug: false,
  logger: { log: bkLog },
  storage: require('botkit-storage-mongo')({ mongoUri: process.env.MONGODB_URI, tables: ['standups']}),
});

var webserver = require(`${__dirname}/components/express_webserver.js`)(controller);

controller.spawn({
  token: process.env.SLACK_TOKEN,
  retry: 5,
}).startRTM((err, bot) => {
  if (err) {
    log.error(err);
    throw new Error(err);
  } else {
    log.info('Connected to RTM');
    bot.identifyBot((err, identity) => {
      log.info(`Bot name: ${identity.name}`);

      // TODO: Only grab js files in /skills directory
      const normalizedPath = require('path').join(__dirname, 'skills');
      require('fs').readdirSync(normalizedPath).forEach((file) => {
        require(`./skills/${file}`).attachSkill(controller);
      });
      log.verbose('All bot skills loaded :D');

      botRunners = require('./runners');
      if (process.env.WEEKEND_DEV) {
        schedule.scheduleJob('* * * * 0-6', botRunners.getReportsRunner(bot));
        schedule.scheduleJob('* * * * 0-6', botRunners.getRemindersRunner(bot));
      } else {
        schedule.scheduleJob('* * * * 1-5', botRunners.getReportsRunner(bot));
        schedule.scheduleJob('* * * * 1-5', botRunners.getRemindersRunner(bot));
      }
      log.verbose('All bot jobs scheduled :D');
    });
  }
});
