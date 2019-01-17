const $ = require('cheerio');
const puppeteer = require('puppeteer');
const authData = require('./constants.json');

const SITE_URL = 'https://my.travelsim.ua/billing/';

const SITE_LOGIN = authData.login;
const SITE_PASSWORD = authData.password;


const getMyNumbers = (requiredNumber, callback = () => {}) => {
  puppeteer
    .launch({headless: true})
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.goto(SITE_URL);
      await page.type('.login [name="login"]', SITE_LOGIN);
      await page.type('.login [name="pwd"]', SITE_PASSWORD);
      await page.click('.login a');
      await page.waitFor('.exit');
      await page.goto('https://my.travelsim.ua/billing/mynums.php');
      await page.waitFor('.myNumbers');


      let userInformationList = [];
      $('.new_rahunok_content.myNumbers > div', await page.content()).each(function (i) {
        userInformationList.push({
          number: $(this).find(`div:nth-child(2) [name="number_${i}"] a`).text().trim(),
          balance: $(this).find(`div:nth-child(3)`).text().trim(),
          name: $(this).find(`div:nth-child(4)`).text().trim()
        });
      });

      const foundedUsers = [];
      userInformationList.forEach((userInformation) => {
        if (userInformation.number.indexOf(requiredNumber) !== -1) {
          foundedUsers.push(userInformation);
        }
      });

      callback(foundedUsers);
    }).catch((err) => {
    console.log('err', err)
  })
};

module.exports.getMyNumbers = getMyNumbers;
