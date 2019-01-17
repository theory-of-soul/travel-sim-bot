const calendar = require('./calendar');
const accountBalanceNotification = require('./accountBalanceNotification');
const phoneInformation = require('./phoneInforamtion');
const showLog = require('./logger');

const getStartCommandKeyboard = () => {
  let startCommandKeyboard = {
    reply_markup: {
      keyboard: [['Показать расходы'], ['Информация по номеру']],
      one_time_keyboard: true,
      resize_keyboard: true,
    }
  };
  startCommandKeyboard.reply_markup.keyboard.push(
    [accountBalanceNotificationButton ? 'Выкл оповещение остатка' : 'Вкл оповещение остатка']
  );

  return startCommandKeyboard;
};

const periodKeyboard = {
  reply_markup: {
    keyboard: [
      ['Показать за выбранный период'],
      // ['Показать за неделю', 'Показать за две недели'],
      ['Назад']
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const setPeriodKeyboard = {
  reply_markup: {
    keyboard: [
      ['установить дату от', 'установить дату до'],
      ['Назад']
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

let accountBalanceNotificationButton = false;

const setAccountDateFrom = (ctx) => {
  calendar.setBillDateFrom(true);
  calendar.getCalendar(ctx);
  ctx.telegram.sendMessage(ctx.chat.id, "Установите период", setPeriodKeyboard);
};

const setAccountDateTo = (ctx) => {
  calendar.setBillDateTo(true);
  calendar.getCalendar(ctx);
};

const backButton = [getStartCommandKeyboard(), periodKeyboard, periodKeyboard];
let stepBackButton = 0;

let phoneInformationFlag = false;

const buttonListener = (bot) => {
  bot.start((ctx) => {
    showLog(ctx.message);
    ctx.telegram.sendMessage(ctx.chat.id, "Добро пожаловать", getStartCommandKeyboard());
  });

  bot.command("set_account_date_from", (ctx) => {
    showLog(ctx.message);
    setAccountDateFrom(ctx);
  });

  bot.command("set_account_date_to", (ctx) => {
    showLog(ctx.message);
    setAccountDateTo(ctx);
  });

  bot.command("show_number_information", (ctx) => {
    showLog(ctx.message);
    ctx.reply("Введите номер телефона");
    stepBackButton = 1;
    phoneInformationFlag = true;
  });

  bot.on('text', (ctx) => {
    showLog(ctx.message);

    if (phoneInformationFlag) {
      phoneInformationFlag = false;
      showLog("Запрос на информацию по номеру обрабатывается.");
      // todo когда Тарас будет на работе вынести в отдельную ф-ию
      ctx.reply("Запрос обрабатывается...");
      phoneInformation.getMyNumbers(ctx.message.text, (users) => {
        let infoRow = "<pre>   Номер      $    Имя</pre>\n";
        users.forEach((user) => {
          infoRow += `${user.number}  ${user.balance}  ${user.name} \n`
        });
        ctx.replyWithHTML(infoRow);
        showLog("Запрос на информацию по номеру выполнен.");
      });
    } else {
      switch (ctx.message.text) {
        case 'Показать расходы':
          stepBackButton = 0;
          ctx.telegram.sendMessage(ctx.chat.id, "За какой период показать расходы?", periodKeyboard);
          break;
        case 'Показать за выбранный период':
          stepBackButton = 1;
          ctx.telegram.sendMessage(ctx.chat.id, "Установите период", setPeriodKeyboard);
          break;
        case 'установить дату от':
          stepBackButton = 1;
          setAccountDateFrom(ctx);
          break;
        case 'установить дату до':
          stepBackButton = 1;
          setAccountDateTo(ctx);
          break;
        case 'Вкл оповещение остатка':
          accountBalanceNotification.turnOn((balance) => {
            ctx.replyWithHTML(
              `<b>Остаток на баласе TravelSim: ${balance}.</b> \nЖелательно пополнить счет для предотвращения наступающей паники.`
            );
          });
          accountBalanceNotificationButton = true;
          ctx.telegram.sendMessage(ctx.chat.id, "Оповещение включено на 50$", getStartCommandKeyboard());
          break;
        case 'Выкл оповещение остатка':
          accountBalanceNotification.turnOff();
          accountBalanceNotificationButton = false;
          ctx.telegram.sendMessage(ctx.chat.id, "Оповещение выключено", getStartCommandKeyboard());
          break;
        case 'Информация по номеру':
          ctx.reply("Введите номер телефона");
          stepBackButton = 1;
          phoneInformationFlag = true;
          break;
        case 'Назад':
          ctx.telegram.sendMessage(ctx.chat.id, "🔙", backButton[stepBackButton]);
          stepBackButton = stepBackButton - 1;
          break;
      }
    }
  });
};

module.exports = buttonListener;