require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});

let currentTrivia = {};

 
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    "Hi! I'm nexxtjsboi_bot. Here's what I can do:\n\n" +
    "/joke - Get a joke\n" +
    "/cat - See a cat pic\n" +
    "/fact - Learn a fact\n" +
    "/fortune - Get a fortune cookie message\n" +
    "/trivia - Answer a question\n" +
    "/meme - See a funny meme\n" +
    "/video - Watch a random short video\n\n" +
    "Need help? Type /help"
  );
});

 
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "I can do these things:\n/joke, /cat, /fact, /fortune, /trivia, /meme, /video");
});

 
bot.onText(/\/joke/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    const joke = `${response.data.setup}\n\n${response.data.punchline}`;
    bot.sendMessage(chatId, joke);
  } catch (error) {
    bot.sendMessage(chatId, "Oops! No jokes right now. Try again later!");
  }
});

 
bot.onText(/\/cat/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    const imageUrl = response.data[0].url;
    bot.sendPhoto(chatId, imageUrl, {caption: "Here's your cat pic!"});
  } catch (error) {
    bot.sendMessage(chatId, "Can't find cats right now. Try again soon!");
  }
});

 
bot.onText(/\/fact/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
    bot.sendMessage(chatId, `Did you know? ${response.data.text}`);
  } catch (error) {
    bot.sendMessage(chatId, "No facts right now. Try again later!");
  }
});

 
bot.onText(/\/fortune/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('http://yerkee.com/api/fortune');
    bot.sendMessage(chatId, `🥠 Your fortune: ${response.data.fortune}`);
  } catch (error) {
    bot.sendMessage(chatId, "No fortunes right now. Try again soon!");
  }
});

 
bot.onText(/\/trivia/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const question = response.data.results[0];
    const options = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
    const optionsText = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
    bot.sendMessage(chatId, `${question.question}\n\n${optionsText}\n\nType the number of your answer!`);
    currentTrivia[chatId] = {
      correctAnswer: question.correct_answer,
      options: options
    };
  } catch (error) {
    bot.sendMessage(chatId, "No trivia right now. Try again later!");
  }
});

 
bot.onText(/\/meme/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://meme-api.herokuapp.com/gimme');
    bot.sendPhoto(chatId, response.data.url, {caption: response.data.title});
  } catch (error) {
    bot.sendMessage(chatId, "Can't find memes right now. Try again soon!");
  }
});

 
bot.onText(/\/video/, async (msg) => {
  const chatId = msg.chat.id;
  currentTrivia[chatId] = null;
  try {
    const response = await axios.get('https://random.dog/woof.json');
    if (response.data.url.endsWith('.mp4')) {
      bot.sendVideo(chatId, response.data.url, {caption: "Here's a random video!"});
    } else {
      bot.sendMessage(chatId, "Couldn't find a video. Try again!");
    }
  } catch (error) {
    bot.sendMessage(chatId, "No videos right now. Try again later!");
  }
});

 
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (currentTrivia[chatId] && !isNaN(msg.text)) {
    const answerIndex = parseInt(msg.text) - 1;
    if (answerIndex >= 0 && answerIndex < currentTrivia[chatId].options.length) {
      const userAnswer = currentTrivia[chatId].options[answerIndex];
      if (userAnswer === currentTrivia[chatId].correctAnswer) {
        bot.sendMessage(chatId, "You got it right! 🎉");
      } else {
        bot.sendMessage(chatId, `Oops! The right answer was: ${currentTrivia[chatId].correctAnswer}. Try another!`);
      }
      currentTrivia[chatId] = null;
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('Bot is starting...');

bot.startPolling()
  .then(() => {
    console.log('Bot is running...');
  })
  .catch((error) => {
    console.error('Error starting bot:', error);
  });