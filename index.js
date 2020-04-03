//import necessary packages
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage"); // To build stages for scenes
const session = require("telegraf/session"); // To create sessions
const Keyboard = require("telegraf-keyboard"); //telegraf keyboard package
const fetch = require("node-fetch"); // To send requests to graphql
const Markup = require("telegraf/markup"); // For inline keyboard
const dotenv = require("dotenv");

dotenv.config();

//import scenes
const scene = require("./registration");
const scene2 = require("./order");
const scene3 = require("./menu");
const scene4 = require("./wallet");
const scene5 = require("./myAccount");
const scene6 = require("./subscription");
const scene7 = require("./myPlan");
const scene8 = require("./addons");
const scene9 = require('./viewOrder');


// intialize app with bot token
const URL = process.env.URL; 
const BOT_TOKEN = process.env.BOT_TOKEN ;
const PORT = process.env.PORT || 5000;
const bot = new Telegraf(process.env.BOT_TOKEN);

// const bot = new Telegraf("1042039654:AAF6QoQG5Ten7_CMmGxSPymbh2FeLOfNSmk");

// Handler For /start command
// ctx is context object.Holds many properties about curent chat
// reply method to send message from bot

bot.start(async ctx => {
  //get current chat ID
  const chatId = ctx.from.id;

  // Query to check if user is already in database

  const userExists = {
    query: `
        query
        {
          userexists(chatId:"${chatId}"){
            name
          }
        }
        `
  };

  //Send request to graphql api about current user

  await fetch("https://metrono-backend.herokuapp.com/graphql", {
    method: "POST",
    body: JSON.stringify(userExists),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      return res.json();
    })
    .then(response => {
      //If user is already in database . Show order Button
      if (response.data.userexists !== null) {
        const keyboard = new Keyboard();
        keyboard
          .add("Wallet", "Menu")
          .add("Subscribe Plans", "Order Meals", "Order Addons")
          .add("My Plans", "My Account","My Orders");
        ctx.reply(
          "Welcome back " + response.data.userexists.name + " Ready to Order?",
          keyboard.draw()
        );
      }

      // Else Prompt user to register and show inline register button
      else {
        ctx.reply(
          "click the below button to register!",
          Markup.inlineKeyboard([
            Markup.callbackButton("Register", "REGISTER_NOW")
          ]).extra()
        );
      }
    })
    .catch(err => console.log(err));
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

//Enable session (not currently used)
bot.use(session());

//Instruct bot to use stage middleware
bot.use(stage.middleware());

// Callback for inline register button .Enter into Regsiter scene
bot.action("REGISTER_NOW", ctx => ctx.scene.enter("Register"));

// Callback for order button .Enter into order scene
bot.hears("Order Meals", ctx => ctx.scene.enter("OrderScene"));

bot.hears("My Orders", ctx => ctx.scene.enter("ViewOrderScene"));

bot.hears("Menu", ctx => ctx.scene.enter("MenuScene"));

bot.action("TODAY", async ctx => {
  const date = new Date();
  const currenDay = date.toDateString().substring(0, 3);

  await ctx.reply("Today's Menu:");
  if (currenDay == "Mon") {
    await ctx.reply(
      "Breakfast : MonBreakfast \n \nLunch : MonLunch \n \nDinner : MonDinner "
    );
  }
  if (currenDay == "Tue") {
    await ctx.reply(
      "Breakfast : TueBreakfast \n \nLunch : TueLunch \n \nDinner : TueDinner "
    );
  }
  if (currenDay == "Wed") {
    await ctx.reply(
      "Breakfast : WedBreakfast \n \nLunch : WedLunch \n\n Dinner : WedDinner "
    );
  }
  if (currenDay == "Thu") {
    await ctx.reply(
      "Breakfast : ThuBreakfast \n \nLunch : ThuLunch \n\n Dinner : ThuDinner "
    );
  }
  if (currenDay == "Fri") {
    await ctx.reply(
      "Breakfast : FriBreakfast \n \nLunch : FriLunch \n\n Dinner : FriDinner "
    );
  }
  if (currenDay == "Sat") {
    await ctx.reply(
      "Breakfast : SatBreakfast \n \nLunch : SatLunch \n \nDinner : SatDinner "
    );
  }
  if (currenDay == "Sun") {
    await ctx.reply(
      "Breakfast : SunBreakfast \n \n Lunch : SunLunch \n \n Dinner :SunDinner "
    );
  }
});

bot.action("TOMORROW_MENU", async ctx => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.toDateString().substring(0, 3);
  await ctx.reply("Tomorrow's Menu:");
  if (tomorrowDay == "Mon") {
    await ctx.reply(
      "Breakfast : MonBreakfast \n \n Lunch : MonLunch \n \n Dinner : MonDinner "
    );
  }
  if (tomorrowDay == "Tue") {
    await ctx.reply(
      "Breakfast : TueBreakfast \n \n Lunch : TueLunch \n \n Dinner : TueDinner "
    );
  }
  if (tomorrowDay == "Wed") {
    await ctx.reply(
      "Breakfast : WedBreakfast \n \n Lunch : WedLunch \n \n Dinner : WedDinner "
    );
  }
  if (tomorrowDay == "Thu") {
    await ctx.reply(
      "Breakfast : ThuBreakfast \n \n Lunch : ThuLunch \n \n Dinner : ThuDinner "
    );
  }
  if (tomorrowDay == "Fri") {
    await ctx.reply(
      "Breakfast : FriBreakfast \n \n Lunch : FriLunch \n \n Dinner : FriDinner "
    );
  }
  if (tomorrowDay == "Sat") {
    await ctx.reply(
      "Breakfast : SatBreakfast \n \n Lunch : SatLunch \n \n Dinner : SatDinner "
    );
  }
  if (tomorrowDay == "Sun") {
    await ctx.reply(
      "Breakfast : SunBreakfast \n \n Lunch : SunLunch \n \n Dinner :SunDinner "
    );
  }
});

bot.hears("Wallet", ctx => ctx.scene.enter("WalletScene"));

bot.action("RECHARGE_NOW", ctx => ctx.scene.enter("WalletScene"));

bot.hears("My Account", ctx => ctx.scene.enter("AccountScene"));

bot.hears("Subscribe Plans", ctx => ctx.scene.enter("SubscriptionScene"));

bot.hears("My Plans", ctx => ctx.scene.enter("MyPlanScene"));

bot.hears("Order Addons", ctx => ctx.scene.enter("AddonScene"));

bot.action("SUBSCRIBE_NOW", ctx => ctx.scene.enter("SubscriptionScene"))


// bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`)

// bot.startWebhook(`/bot${BOT_TOKEN}`, null, 5000)

// bot.launch();


bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
