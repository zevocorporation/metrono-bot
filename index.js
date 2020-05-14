//import necessary packages
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage"); // To build stages for scenes
const session = require("telegraf/session"); // To create sessions
const Markup = require("telegraf/markup"); // For inline keyboard


const helper = require("./helper");
const { startKeyboard } = helper;

//import scenes
const scene = require("./registration");
const scene2 = require("./order");
const scene3 = require("./menu");
const scene4 = require("./wallet");
const scene5 = require("./myAccount");
const scene6 = require("./subscription");
const scene7 = require("./myPlan");
const scene8 = require("./addons");
const scene9 = require("./viewOrder");

// intialize app with bot token
const URL = process.env.URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 5000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Handler For /start command
// ctx is context object.Holds many properties about curent chat
// reply method to send message from bot



bot.start(async (ctx) => {
  user = await helper.verifyUser(ctx);
  console.log(user);

  if (!user) {
    ctx.reply(
      "Lets get started! Click below to register",
      Markup.inlineKeyboard([
        Markup.callbackButton("Register", "REGISTER_NOW"),
      ]).extra()
    );
  } else {
    ctx.reply(
      "Hi ! " + user.name + ". How can we help you order today?",
      startKeyboard.draw()
    );
  }
});



// Intialize stage object
// Stages and scenes are used for dialogue between bot and user
const stage = new Stage();

//Register imported scene to use them
stage.register(scene.registerScene);
stage.register(scene2.orderScene);
stage.register(scene3.menuScene);
stage.register(scene4.walletScene);
stage.register(scene5.accountScene);
stage.register(scene6.subscriptionScene);
stage.register(scene7.myplanScene);
stage.register(scene8.addonScene);
stage.register(scene9.viewOrderScene);

stage.hears("Home", async (ctx) => {
  user = await helper.verifyUser(ctx);

  if (!user) {
    ctx.reply(
      "Lets get started! Click below to register",
      Markup.inlineKeyboard([
        Markup.callbackButton("Register", "REGISTER_NOW"),
      ]).extra()
    );
  } else {
    ctx.reply(
      "Hi! " + user.name + ". How can we help you order today?",
      startKeyboard.draw()
    );
  }
  return ctx.scene.leave();
});

//Enable session (not currently used)
bot.use(session());

//Instruct bot to use stage middleware
bot.use(stage.middleware());


bot.action("REGISTER_NOW", (ctx) => ctx.scene.enter("Register"));

bot.hears("Onetime order", (ctx) => ctx.scene.enter("OrderScene"));

bot.hears("My Orders", (ctx) => ctx.scene.enter("ViewOrderScene"));

bot.hears("Menu", (ctx) => ctx.scene.enter("MenuScene"));

bot.hears("Wallet", (ctx) => ctx.scene.enter("WalletScene"));

bot.action("RECHARGE_NOW", (ctx) => ctx.scene.enter("WalletScene"));

bot.hears("My Account", (ctx) => ctx.scene.enter("AccountScene"));

bot.hears("Subscribe Plans", (ctx) => ctx.scene.enter("SubscriptionScene"));

bot.hears("My Plans", (ctx) => ctx.scene.enter("MyPlanScene"));

bot.hears("Order Addons", (ctx) => ctx.scene.enter("AddonScene"));

bot.action("SUBSCRIBE_NOW", (ctx) => ctx.scene.enter("SubscriptionScene"));

bot.action("TODAY", async (ctx) => {
  scene3.displayTodayMenu(ctx);
});

bot.action("TOMORROW_MENU", async (ctx) => {
  scene3.displayTommorrowMenu(ctx);
});

bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
