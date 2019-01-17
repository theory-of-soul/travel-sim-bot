const Telegraf = require('telegraf');
const buttonListener = require('./buttonListener');
const calendar = require('./calendar');
const authData = require('./constants.json');

process.env.TZ = 'Europe/Kiev';
const TOKEN = authData.token;

const bot = new Telegraf(TOKEN);

buttonListener(bot);
calendar.setCalendar(bot);

bot.startPolling();