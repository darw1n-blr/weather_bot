require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const request = require('request')

const token = process.env.TOKEN

const bot = new TelegramApi(token, {polling:true})

bot.onText(/\/start/, (message) => {
    const chatId = message.chat.id
    bot.sendMessage(chatId, "Привет! Напиши название города, в котором хочешь узнать погоду")
})


bot.on('message', message => {

    if(message.text === '/start') return null

    const chatId = message.chat.id

    let city = message.text

    const cityOptions = {
            'method': 'GET',
            'url': process.env.CITY_URL,
            'qs': {
                "q": city,
                "limit": "1",
                "appid": process.env.API_KEY
            }
        }

    request(cityOptions, (error, response) => {
        if (error) { console.log(error) }
        let data = response.body
        data = JSON.parse(data)

        if(!data.length){
            bot.sendMessage(chatId, "Такого города я не знаю :(")
            return null
        }

        const lat = data[0].lat
        const lon = data[0].lon
        const weatherOptions = {
            'method': 'GET',
            'url': process.env.WEATHER_URL,
            'qs': {
                "lat": lat,
                "lon": lon,
                "appid": process.env.API_KEY
            }

        }

        request(weatherOptions, (error, response) => {
            if (error) { console.log(error) }
            let data = response.body
            data = JSON.parse(data)
            let temp = Math.round(data.main.temp - 273)
            let feelsLike = Math.round(data.main.feels_like - 273)
            let humidity = data.main.humidity
            let pressure = data.main.pressure
            bot.sendMessage(chatId, `Температура в городе ${city}:  ${temp}  °C\nОщущается как: ${feelsLike} °C\nВлажность воздуха: ${humidity} %\nАтмосферное давление: ${pressure} мм рт.ст.\n`)

        })

    })



})