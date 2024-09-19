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

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
]);

let isBankChosen = false;
let isCashWritten = false;
let isOutput = false;
let isRefill = false;
let isRequisitesWritten = false;
let requisites;
let sumMany;
let bank = '';
const outputGroupId = "-4562169457";
const reffilGroupId = "-4598841007";

bot.command("start", async (ctx) => {
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

bot.hears("ПОПОЛНИТЬ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ пополнения счета");

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button")
    .text("Bakai", "bakai_button")
    .text("Optima", "optima_button");
  isOutput = false;
  isBankChosen = false;
  isCashWritten = false;
  isRequisitesWritten = false;
  isRefill = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});
bot.callbackQuery("mbank_button", async (ctx) => {
  await ctx.reply("Вы выбрали MBANK, укажите сумму пополнения(СОМ)");
  isBankChosen = true;
  bank = 'MBANK';
});
bot.callbackQuery("bakai_button", async (ctx) => {
  await ctx.reply("Вы выбрали Bakai, укажите сумму пополнения(СОМ)");
  isBankChosen = true;
  bank = 'Bakai';
});
bot.callbackQuery("optima_button", async (ctx) => {
  await ctx.reply("Вы выбрали Optima, укажите сумму пополнения(СОМ)");
  isBankChosen = true;
  bank = 'Optima';
});

bot.hears("ВЫВЕСТИ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ вывод средств");

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button_output")
    .text("Bakai", "bakai_button_output")
    .text("Optima", "optima_button_output");
  isRefill = false;
  isRequisitesWritten = false;
  isBankChosen = false;
  isCashWritten = false;
  isOutput = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("mbank_button_output", async (ctx) => {
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  isBankChosen = true;
  bank = 'MBANK';
});
bot.callbackQuery("bakai_button_output", async (ctx) => {
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  isBankChosen = true;
  bank = 'Bakai';
});
bot.callbackQuery("optima_button_output", async (ctx) => {
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  isBankChosen = true;
  bank = 'Optima';
});

bot.on("msg:text", async (ctx) => {
  const userInfo = ctx.update.message.from;
  const text = ctx.update.message.text;
  let textToNumber;
  if (!isNaN(Number(text))) {
    textToNumber = parseInt(text);
    // console.log("parse to int = ", typeof textToNumber);
  }
  console.log(ctx);
  
  if (isBankChosen && isRefill) {
    if (typeof textToNumber === "number") {
      //   console.log("text is number");
      if (textToNumber >= 10 && textToNumber <= 10000) {
        isBankChosen = false;
        isCashWritten = true;
        sumMany = textToNumber;
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

  if (isCashWritten) {
    if (typeof textToNumber === "number") {
      // console.log("text is number");
      if (text.length === 8) {
        // console.log(text.length, "кол-во символов");
        isCashWritten = false;
        const xbetId = text;

        if (isRefill) {
          await bot.api.sendMessage(
            reffilGroupId,
            `Новый пользователь хочет пополнить счет.\nИмя: ${
              userInfo?.first_name ?? "Отсуствует"
            }\nЛогин: ${userInfo?.username ?? "Отсуствует"}\nЧат ID: ${
              ctx.chatId
            }\n\n1XBET ID: ${xbetId}\nСпособ: ${bank}\nСумма вывода: ${sumMany}`
          );

          // const urlKeyboard = new InlineKeyboard().url(
          //   "ГРУППА ПОПОЛНЕНИЯ",
          //   "https://t.me/+i7QcaHtIjqoxMWYy"
          // );
          return await ctx.reply(
            "Супер✅! для дальнейших действия необходимо перейти в группу👇",
            // {
            //   reply_markup: urlKeyboard,
            // }
          );
        } else if (isOutput) {
          await bot.api.sendMessage(
            outputGroupId,
            `Новый пользователь хочет вывести средства.\nИмя: ${
              userInfo?.first_name ?? "Отсуствует"
            }\nЛогин: ${
              userInfo?.username ?? "Отсуствует"
            }\n\n1XBET ID: ${xbetId}\nСпособ: ${bank}\nРеквизиты: ${requisites}\nСумма вывода: ${sumMany}`
          );
          // const urlKeyboard = new InlineKeyboard().url(
          //   "ГРУППА ВЫВОДА",
          //   "https://t.me/+dKc-R6orTlNmOTgy"
          // );
          return await ctx.reply(
            "Супер✅! для дальнейших действия необходимо перейти в группу👇",
            // {
            //   reply_markup: urlKeyboard,
            // }
          );
        }
      } else {
        await ctx.reply("Кол-во цифр должно равняться 8");
      }
    } else {
      await ctx.reply("Нужно ввести только цифры");
    }
  }

  if (isOutput && isBankChosen) {
    isCashWritten = true;
    isBankChosen = false;
    requisites = text;
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