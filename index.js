const TelegramBot = require("node-telegram-bot-api");
const Cache = require("node-cache");
const fetch = require("node-fetch");

const CMC_API_URL = "https://api.coinmarketcap.com/v1/ticker/revain/";

const cache = new Cache({ stdTTL: 60 });

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const formatDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZoneName: "short"
}).format;

const getPrice = async () => {
  let price = cache.get("price");

  if (!price) {
    const [{ price_usd }] = await (await fetch(CMC_API_URL)).json();

    price = { price: price_usd, date: formatDate(new Date()) };
    cache.set("price", price);
  }

  return price;
};

const formatPrice = ({ price, date }) => `R token price is $${price} (${date})`;

bot.onText(/\/price/, async msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, formatPrice(await getPrice()));
});

const HELP_MESSAGE = `
/help — get this message
/price — get the price of R token
`;

bot.onText(/\/help/, async msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, HELP_MESSAGE);
});
