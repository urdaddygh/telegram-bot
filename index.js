const TelegramApi = require('node-telegram-bot-api')

const token = '7396487794:AAE_ltI7JM9KhpZGJJ9jSpq_82fIeRTu5QI'

const bot = new TelegramApi(token, {polling: true});

const toPayOptions = {
    reply_markup:JSON.stringify({inline_keyboard:[
        [{text:'MBANK', callback_data:'MBANK'}],
        [{text:'Bakai', callback_data:'BAKAI'}],
        [{text:'Optima', callback_data:'OPTIMA'}]
    ]})
}
const anotherGroupOptions = {
    reply_markup:JSON.stringify({inline_keyboard:[
        [{text:'Вывод', callback_data:'OUTPUT'}],
        [{text:'Пополнение', callback_data:'REFILL'}],
    ]})
}
const start =()=>{
    bot.setMyCommands([
        {command:'/start', description:'Салам'},
        {command:'/info', description:'че там'},
        {command:'/payment', description:'Способы оплаты'}
    ])
    let isSendId = false;
    let isSendPhoto = false;

    bot.on('message', async msg=>{
        const text = msg.text;
        const chatId = msg.chat.id;
        const photo = msg.photo;
        if(text === '/start'){
            return bot.sendMessage(chatId, 'Приветствую на кассе 1Хбет, скиньте айди');
        }

        if(text === '/info'){
            return bot.sendMessage(chatId, 'Нужно скинуть айди');
        }

        if(text === '/payment'){
            return bot.sendMessage(chatId, 'Выберите способ оплаты', toPayOptions)
        }

        if(!isNaN(Number(text))){
            isSendId = true;
            return bot.sendMessage(chatId, 'Отправьте фотографию чека')
        }
         // Проверяем, если фото отправлено после ID
         if (isSendId && photo) {
            isSendPhoto = true;
            return bot.sendMessage(chatId, 'Выберите что вы хотите сделать', anotherGroupOptions);
        }
        return bot.sendMessage(chatId, 'Неизвестная комманда, прошу введите корректную комманду')
    })

    bot.on('callback_query', async msg=>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        // console.log(msg);
        if (data === 'OUTPUT' || data === 'REFILL') {
            // Отправляем сообщение в другую группу
            await bot.sendMessage(otherGroupId, `Пользователь выбрал: ${data}`);
            return bot.sendMessage(chatId, `Твое действие "${data}" отправлено в другую группу.`);
        }
        bot.sendMessage(chatId, `Ты выбрал ${data}`);
    })
}

start();