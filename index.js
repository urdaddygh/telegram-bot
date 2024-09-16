require("dotenv").config();

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");
const bot = new Bot(process.env.BOT_API_KEY);

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "info",
    description: "Нужен айди",
  },
]);

let isBankChosen = false;
let isCashWritten = false;
let isOutput = false;
let isRefill = false;

bot.command("start", async (ctx) => {
  const infoKeyboard = new Keyboard()
    .text("ПОПОЛНИТЬ")
    .text("ВЫВЕСТИ")
    .resized();
  await ctx.reply("Приветствую на кассе 1Хбет, скиньте айди", {
    reply_markup: infoKeyboard,
  });
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
    isRefill = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});
bot.callbackQuery("mbank_button", async (ctx) => {
    await ctx.reply("Вы выбрали MBANK, укажите сумму пополнения(СОМ)");
    isBankChosen = true;
  });
  bot.callbackQuery("bakai_button", async (ctx) => {
    await ctx.reply("Вы выбрали Bakai, укажите сумму пополнения(СОМ)");
    isBankChosen = true;
  });
  bot.callbackQuery("optima_button", async (ctx) => {
    await ctx.reply("Вы выбрали Optima, укажите сумму пополнения(СОМ)");
    isBankChosen = true;
  });


bot.hears("ВЫВЕСТИ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ вывод средств");

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button_output")
    .text("Bakai", "bakai_button_output")
    .text("Optima", "optima_button_output");
    isRefill = false;
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
});
bot.callbackQuery("bakai_button_output", async (ctx) => {
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  isBankChosen = true;
});
bot.callbackQuery("optima_button_output", async (ctx) => {
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  isBankChosen = true;
});


bot.on("msg:text", async (ctx) => {
  const text = ctx.update.message.text;
  let textToNumber;
  if (!isNaN(Number(text))) {
    textToNumber = parseInt(text);
    // console.log("parse to int = ", typeof textToNumber);
  }
  console.log(isBankChosen);
  if (isBankChosen && isRefill) {
    if (typeof textToNumber === "number") {
      //   console.log("text is number");
      if (textToNumber >= 100 && textToNumber <= 100000) {
        isBankChosen = false;
        isCashWritten = true;
        return await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
      } else {
        await ctx.reply(
          "Сумма депозита указана некорректна, попробуйте снова \n\nМинимум: 100 сом\nМаксимум: 1000000 сом"
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
        return await ctx.reply("Супер!");
      } else {
        await ctx.reply("Кол-во цифр должно равняться 8");
      }
    } else {
      await ctx.reply("Нужно ввести только цифры");
    }
  }

  if(isOutput&&isBankChosen){
    isCashWritten = true;
    isBankChosen = false;
    return await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
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
// const toPayOptions = {
//     reply_markup:JSON.stringify({inline_keyboard:[
//         [{text:'MBANK', callback_data:'MBANK'}],
//         [{text:'Bakai', callback_data:'BAKAI'}],
//         [{text:'Optima', callback_data:'OPTIMA'}]
//     ]})
// }
// const anotherGroupOptions = {
//     reply_markup:JSON.stringify({inline_keyboard:[
//         [{text:'Вывод', callback_data:'OUTPUT'}],
//         [{text:'Пополнение', callback_data:'REFILL'}],
//     ]})
// }
// const start =()=>{
//     bot.setMyCommands([
//         {command:'/start', description:'Салам'},
//         {command:'/info', description:'че там'},
//         {command:'/payment', description:'Способы оплаты'}
//     ])
//     let isSendId = false;
//     let isSendPhoto = false;

//     bot.on('message', async msg=>{
//         const text = msg.text;
//         const chatId = msg.chat.id;
//         const photo = msg.photo;
//         if(text === '/start'){
//             return bot.sendMessage(chatId, 'Приветствую на кассе 1Хбет, скиньте айди');
//         }

//         if(text === '/info'){
//             return bot.sendMessage(chatId, 'Нужно скинуть айди');
//         }

//         if(text === '/payment'){
//             return bot.sendMessage(chatId, 'Выберите способ оплаты', toPayOptions)
//         }

//         if(!isNaN(Number(text))){
//             isSendId = true;
//             return bot.sendMessage(chatId, 'Отправьте фотографию чека')
//         }
//          // Проверяем, если фото отправлено после ID
//          if (isSendId && photo) {
//             isSendPhoto = true;
//             return bot.sendMessage(chatId, 'Выберите что вы хотите сделать', anotherGroupOptions);
//         }
//         return bot.sendMessage(chatId, 'Неизвестная комманда, прошу введите корректную комманду')
//     })

//     bot.on('callback_query', async msg=>{
//         const data = msg.data;
//         const chatId = msg.message.chat.id;
//         // console.log(msg);
//         if (data === 'OUTPUT' || data === 'REFILL') {
//             // Отправляем сообщение в другую группу
//             await bot.sendMessage(otherGroupId, `Пользователь выбрал: ${data}`);
//             return bot.sendMessage(chatId, `Твое действие "${data}" отправлено в другую группу.`);
//         }
//         bot.sendMessage(chatId, `Ты выбрал ${data}`);
//     })
// }

// start();
