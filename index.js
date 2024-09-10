const TelegramApi = require('node-telegram-bot-api')

const token = '7396487794:AAE_ltI7JM9KhpZGJJ9jSpq_82fIeRTu5QI'

const bot = new TelegramApi(token, {polling: true});

const toPayOptions = {
    reply_markup:JSON.stringify({inline_keyboard:[
        [{text:'MBANK', callback_data:'1'}]
    ]})
}
const start =()=>{
    bot.setMyCommands([
        {command:'/start', description:'Салам'},
        {command:'/info', description:'че там'}
    ])

    bot.on('message', async msg=>{
        const text = msg.text;
        const chatId = msg.chat.id;
        
        if(text === '/start'){
            return bot.sendMessage(chatId, 'Приветствую на кассе 1Хбет, скиньте айди');
        }
        if(text === '/info'){
            await bot.sendMessage(chatId, 'Нужно скинуть айди');
            return bot.sendMessage(chatId, 'dsadsa', toPayOptions)
        }
        return bot.sendMessage(chatId, 'Не понял тебя брат')
    })

    bot.on('callback_query', msg=>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        // console.log(msg);
        bot.sendMessage(chatId, `Ты выбрал ${data}`);
    })
}

start();