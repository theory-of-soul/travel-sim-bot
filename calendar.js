const Calendar = require('telegraf-calendar-telegram');
const MyTravelSimApi = require('./travelSimAPI');
const showLog = require('./logger');

let billDateFrom = false;
let billDateTo = false;

let calendar;

const setBillDateFrom = (value) => {
  billDateFrom = value;
};

const setBillDateTo = (value) => {
  billDateTo = value;
};

const setCalendar = (bot) => {
  calendar = new Calendar(bot, {
    startWeekDay: 1,
    weekDayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    monthNames: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    minDate: '',
    maxDate: null
  });

  calendar.setDateListener((context, date) => {
    context.reply(date);


    if (billDateFrom === true) {
      showLog("Выбрана дата от:", date);

      setBillDateFrom(date);
    } else if (billDateTo === true) {
      showLog("Выбрана дата до:", date);

      setBillDateTo(date);
      if (billDateFrom <= billDateTo) {
        showLog(`Запрос отправлен ${billDateFrom} - ${billDateTo}`);
        context.reply("Запрос отправлен...");
        //todo: подумать как убрать от сюда логику
        MyTravelSimApi.getCosts(billDateFrom, billDateTo, context);
      } else {
        showLog(`Ошибка в выборе дат - неправильный период`);
        context.reply("Выберите правильный период");
      }
    }
  });
};

const getCalendar = (context) => {
  const today = new Date();
  const minDate = new Date();
  minDate.setMonth(today.getMonth() - 2);
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 2);
  maxDate.setDate(today.getDate());

  return context.reply("Выберите дату:", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar());
};

module.exports.setCalendar = setCalendar;
module.exports.getCalendar = getCalendar;
module.exports.setBillDateFrom = setBillDateFrom;
module.exports.setBillDateTo = setBillDateTo;