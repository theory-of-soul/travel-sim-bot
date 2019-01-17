const $ = require('cheerio');
const puppeteer = require('puppeteer');
const authData = require('./constants.json');
const showLog = require('./logger');

const SITE_URL = 'https://my.travelsim.ua/billing/';

const SITE_LOGIN = authData.login;
const SITE_PASSWORD = authData.password;

let intervalNotification;
let oneMinuteNotificationFlag = false;

const notify = (html, minAccountBalance, callback) => {
  let accountBalance = $('.new_rahunok_content > div > div:nth-child(2)', html).text();
  showLog("Вывод оповещения о балансе", accountBalance);

  oneMinuteNotificationFlag = !oneMinuteNotificationFlag;
  if (accountBalance < minAccountBalance && oneMinuteNotificationFlag) {
    callback(accountBalance);
  }
};

let notificatinPageBrowser;

const turnOnAccountBalanceNotification = (callback = () => {}, minAccountBalance = 50) => {
  puppeteer
    .launch({headless: true})
    .then(async (browser) => {
      notificatinPageBrowser = browser;
      const page = await browser.newPage();
      await page.goto(SITE_URL);
      await page.type('.login [name="login"]', SITE_LOGIN);
      await page.type('.login [name="pwd"]', SITE_PASSWORD);
      await page.click('.login a');
      await page.waitFor('.exit');
      await page.goto('https://my.travelsim.ua/billing/corporate.php');

      notify(await page.content(), minAccountBalance, callback);

      intervalNotification = setInterval(async () => {
        await page.reload();
        notify(await page.content(), minAccountBalance, callback);
      }, 30000);
    }).catch((err) => {
      console.log('err', err)
  })
};

const turnOffAccountBalanceNotification = () => {
  oneMinuteNotificationFlag = false;
  clearInterval(intervalNotification);
  notificatinPageBrowser.close();
};

module.exports.turnOn = turnOnAccountBalanceNotification;
module.exports.turnOff = turnOffAccountBalanceNotification;
