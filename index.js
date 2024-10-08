require("dotenv").config();

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
  InputFile,
} = require("grammy");

const bot = new Bot(process.env.BOT_API_KEY);
const sessions = new Map();

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
]);

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      isBankChosen: false,
      isCashWritten: false,
      isOutput: false,
      isRefill: false,
      waitCheck: false,
      isRequisitesWritten: false,
      isAccepted: false,
      isRejected: false,
      waitAnswer:false,
      requisites: '',
      sumMany: '',
      bank: '',
      xbetIdGlobal: '',
    });
  }
  return sessions.get(userId);
}

function clearSession(userId) {
  sessions.delete(userId);
}

const outputGroupId = "-4562169457";
const reffilGroupId = "-4598841007";

let mbankRequisites = '504061111';
let optimaRequisites = '4169585351289654';
let bakaiRequisites = '7760611111';
let shift = 'Не выбран';

bot.command("start", async (ctx) => {
  clearSession(ctx.from.id);
  const session = getSession(ctx.from.id);
  if (ctx.chat.type !== "group") {
    const infoKeyboard = new Keyboard()
      .text("ПОПОЛНИТЬ")
      .text("ВЫВЕСТИ")
      .resized();
    await ctx.reply("Приветствую на кассе 1Хбет", {
      reply_markup: infoKeyboard,
    });
  }
});

bot.command("edil", async (ctx) => {
  if (ctx.chat.type === "group") {
    shift = 'Эдил';
    mbankRequisites='321321321'
    optimaRequisites='321321312312'
    bakaiRequisites='321321321'
    await ctx.reply("Приветствую Эдил, переключаю на вашу смену");
  }
});

bot.command("daniyar", async (ctx) => {
  if (ctx.chat.type === "group") {
    shift = 'Данияр';
    mbankRequisites='504061111'
    optimaRequisites='4169585351289654'
    bakaiRequisites='7760611111'
    await ctx.reply("Приветствую Данияр, переключаю на вашу смену");
  }
});

bot.hears("ПОПОЛНИТЬ", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Укажите удобный вам способ пополнения счета",{
    reply_markup: {
      remove_keyboard:true
    },
  });

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button")
    .text("Bakai", "bakai_button")
    .text("Optima", "optima_button");

    session.isRefill = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});
bot.callbackQuery("mbank_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали MBANK, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'MBANK';
    await ctx.deleteMessage();
});
bot.callbackQuery("bakai_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали Bakai, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'Bakai';
    await ctx.deleteMessage();
});
bot.callbackQuery("optima_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали Optima, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'Optima';
    await ctx.deleteMessage();
});

bot.hears("ВЫВЕСТИ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ вывод средств", {
    reply_markup: {
      remove_keyboard:true
    },
  });

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button_output")
    .text("Bakai", "bakai_button_output")
    .text("Optima", "optima_button_output");
    const session = getSession(ctx.from.id);

    session.isOutput = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("mbank_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'MBANK';
});
bot.callbackQuery("bakai_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'Bakai';
});
bot.callbackQuery("optima_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'Optima';
  console.log(session);
});

bot.callbackQuery("accept", async (ctx) => {
    const session = getSession(ctx.from.id);
    if(session.isRefill&&session.waitAnswer){
    bot.api.sendMessage(ctx.from.id, "Транзакция прошла✅");
    session.isRefill = false;
    session.waitAnswer = false;
    clearSession(ctx.from.id);
  }
});
bot.callbackQuery("reject", async (ctx) => {
  const session = getSession(ctx.from.id);
  if(session.isRefill&&session.waitAnswer){
  bot.api.sendMessage(ctx.from.id, "Транзакция отклонена❌");
  session.isRefill = false;
  session.waitAnswer = false;
  clearSession(ctx.from.id);
}
});

bot.on(":photo", async (ctx) => {
  const session = getSession(ctx.from.id);
  const userInfo = ctx.from;
  // const userId = userInfo.id;
  const photos = ctx.message.photo;
  // Выбираем наивысшего качества (последний элемент в массиве)

  const highestQualityPhoto = photos[photos.length - 1];
  if (session.waitCheck && session.isRefill) {
    const caption = `Чек от пользователя:\nИмя: ${
      userInfo?.first_name ?? "Отсутствует"
    }\nЛогин: ${userInfo?.username ?? "Отсутствует"}\nЧат ID: ${
      ctx.chatId
    }\n\n1XBET ID: ${session.xbetIdGlobal}\nСпособ: ${
      session.bank
    }\nСумма пополнения: ${session.sumMany}\n\nСмена: ${shift}`;
    // Отправляем фотографию в другую группу

    const acceptRejectKeyboard = new InlineKeyboard()
      .text("Принять", "accept")
      .text("Отклонить", "reject");

      session.waitCheck = false;
      session.waitAnswer = true;

    await bot.api.sendPhoto(reffilGroupId, highestQualityPhoto.file_id, {
      caption: caption,
      reply_markup: acceptRejectKeyboard,
    });

    return await ctx.reply("Отлично! Средства поступят после проверки чека");
  }
});

bot.on("msg:text", async (ctx) => {
  const session = getSession(ctx.from.id);
  const userInfo = ctx.update.message.from;
  const text = ctx.update.message.text;
  let textToNumber;
  if (!isNaN(Number(text))) {
    textToNumber = parseInt(text);
    // console.log("parse to int = ", typeof textToNumber);
  }
  // console.log(ctx);
  
  if (session.isBankChosen && session.isRefill) {
    if (typeof textToNumber === "number") {
      //   console.log("text is number");
      if (textToNumber >= 10 && textToNumber <= 10000) {
        session.isBankChosen = false;
        session.isCashWritten = true;
        session.sumMany = textToNumber;
        await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
        return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
      } else {
        await ctx.reply(
          "Сумма депозита указана некорректна, попробуйте снова \n\nМинимум: 10 сом\nМаксимум: 10000 сом"
        );
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isCashWritten) {
    if (typeof textToNumber === "number") {
      // console.log("text is number");
      if (text.length === 9) {
        // console.log(text.length, "кол-во символов");
        session.isCashWritten = false;
        const xbetId = text;
        session.xbetIdGlobal = text;
        if (session.isRefill) {
          // const acceptRejectKeyboard = new InlineKeyboard()
          // .text("Принять", "accept")
          // .text("Отклонить", "reject")

          // await bot.api.sendMessage(
          //   reffilGroupId,
          //   `Новый пользователь хочет пополнить счет.\nИмя: ${
          //     userInfo?.first_name ?? "Отсуствует"
          //   }\nЛогин: ${userInfo?.username ?? "Отсуствует"}\nЧат ID: ${
          //     ctx.chatId
          //   }\n\n1XBET ID: ${xbetId}\nСпособ: ${
          //     session.bank
          //   }\nСумма пополнения: ${session.sumMany}\n\n\nСмена: ${shift}`,
          //   {
          //     reply_markup: acceptRejectKeyboard,
          //   }
          // );

          if (session.bank === "MBANK") {
            await ctx.reply(
              `Пополните средства на MBANK по нижеуказанному реквизиту👇\nMBANK: ${mbankRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === "Bakai") {
            await ctx.reply(
              `Пополните средства на Bakai по нижеуказанному реквизиту👇\nBakai: ${bakaiRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === "Optima") {
            await ctx.reply(
              `Пополните средства на Optima по нижеуказанному реквизиту👇\nOptima: ${optimaRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          return (session.waitCheck = true);
        } else if (session.isOutput) {
          await bot.api.sendMessage(
            outputGroupId,
            `Новый пользователь хочет вывести средства.\nИмя: ${
              userInfo?.first_name ?? "Отсуствует"
            }\nЛогин: ${
              userInfo?.username ?? "Отсуствует"
            }\n\n1XBET ID: ${xbetId}\nСпособ: ${session.bank}\nРеквизиты: ${session.requisites}\nСумма вывода: ${session.sumMany}\n\n\nСмена: ${shift}`
          );
          // const urlKeyboard = new InlineKeyboard().url(
          //   "ГРУППА ВЫВОДА",
          //   "https://t.me/+dKc-R6orTlNmOTgy"
          // );
          return await ctx.reply(
            "Супер✅! Ожидайте.",
            // {
            //   reply_markup: urlKeyboard,
            // }
          );
        }
      } else {
        await ctx.reply("Кол-во цифр должно равняться 9");
      }
    } else {
      await ctx.reply("Нужно ввести только цифры");
    }
  }

  if(session.isRefill && session.waitCheck){
    await ctx.reply(
      `Нужно отправить скриншот чека!`
    );
  }

  if (session.isOutput && session.isBankChosen) {
    session.isCashWritten = true;
    session.isBankChosen = false;
    session.requisites = text;
    await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
    return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();