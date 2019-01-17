const $ = require('cheerio');
const puppeteer = require('puppeteer');
const authData = require('./constants.json');
const showLog = require('./logger');

const SITE_URL = 'https://my.travelsim.ua/billing/';

const SITE_LOGIN = authData.login;
const SITE_PASSWORD = authData.password;

const getCosts = (dateFrom, dateTo, ctx) => {
  puppeteer
    .launch({headless: true})
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.goto(SITE_URL);
      await page.type('.login [name="login"]', SITE_LOGIN);
      await page.type('.login [name="pwd"]', SITE_PASSWORD);
      await page.click('.login a');
      await page.waitFor('.exit');
      await page.goto('https://my.travelsim.ua/billing/corporate.php');
      await page.click('.new_rahunok_content a');
      await page.waitFor('.zvit');

      await page.$eval('#date_from', (e, date) => e.setAttribute("value", date), ...[dateFrom]);
      await page.$eval('#date_to', (e, date) => e.setAttribute("value", date), ...[dateTo]);

      await page.$eval('[name=corp_report]', e => e.setAttribute("target", ""));
      await page.click('.zvit .red');
      await page.waitForSelector('.config', {timeout: 0});

      return {
        content: await page.content(),
        browser
      };
    }).then((browserInfo) => {
    const rows = $('.new_rahunok_content', browserInfo.content).children();
    if (rows.length > 0) {
      let answer = [`<pre>     Дата          Телефон     +$  Остаток</pre>`];

      rows.each(function(i, elem) {
        const columns = $(this).children();

        if (columns.length > 0) {
          let addRow = "";
          columns.each(function(i) {
            if (i === 2) {
              addRow += " " + $(this).text() + " "
            } else if (i === 3) {
              addRow += "    " + $(this).text()
            } else {
              addRow += $(this).text() + " "
            }

          });
          answer.push(addRow);
        }
      });

      while (answer.length > 74) {
        ctx.replyWithHTML(answer.slice(0, 74).join('\n'));
        answer = answer.slice(74);
      }

      if (answer.length !== 0) {
        setTimeout(() => {
          ctx.replyWithHTML(answer.join('\n'))
        }, 300);
      }
    }


    showLog('Получена и отправлена выписка по номерам');

    browserInfo.browser.close();
  }).catch((err) => {
    console.log('err', err)
  })
};

module.exports.getCosts = getCosts;
