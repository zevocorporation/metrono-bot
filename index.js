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
          "Hi " + response.data.userexists.name + "! .How can we help you order today?",
          keyboard.draw()
        );
      }

      // Else Prompt user to register and show inline register button
      else {
        ctx.reply(
          "Lets get started ! Click the below button and match the follow ups!",
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



bot.hears("Wallet", ctx => ctx.scene.enter("WalletScene"));

bot.action("RECHARGE_NOW", ctx => ctx.scene.enter("WalletScene"));

bot.hears("My Account", ctx => ctx.scene.enter("AccountScene"));

bot.hears("Subscribe Plans", ctx => ctx.scene.enter("SubscriptionScene"));

bot.hears("My Plans", ctx => ctx.scene.enter("MyPlanScene"));

bot.hears("Order Addons", ctx => ctx.scene.enter("AddonScene"));

bot.action("SUBSCRIBE_NOW", ctx => ctx.scene.enter("SubscriptionScene"));


bot.action("TODAY", async ctx => {
  const date = new Date();
  const currenDay = date.toDateString().substring(0, 3);

  
  if (currenDay == "Mon") {
   
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with moong dhaal curry,seasonal vegetable & paapad\n\nDinner : \nPoori with potato mash\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with pachapayir sambar,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash"
    );
  }
  if (currenDay == "Tue") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with toor dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with sambar,seasonal vegetable & paapad\n\n_Dinner_ \nMasala dosa with chutney "
    );
  }
  if (currenDay == "Wed") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with rajma curry,seasonal vegetable & paapad\n\n_Dinner_ \nPhulka with panner butter masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nIdly with chutney and sambar\n\n_Lunch_ \nWhite rice with vathal kulambu,seasonal vegetable & paapad\n\n_Dinner_ \nIdly with sambar"
    );
  }
  if (currenDay == "Thu") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with khadi,seasonal vegetable & paapad\n\n_Dinner_ \nChole batura\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with more kolambu,seasonal vegetable & paapad\n\n_Dinner_ \nchole batura"
    );
  }
  if (currenDay == "Fri") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nAloo paratha with curd & pickle\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nCumin rice with gravy"
    );
  }
  if (currenDay == "Sat") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with channa dhaal,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with matar paneer\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with kadala curry,seasonal vegetable & paapad\n\n_Dinner_ \nPuttu with kadala curry"
    );
  }
  if (currenDay == "Sun") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala"
    );
  }
});

bot.action("TOMORROW_MENU", async ctx => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.toDateString().substring(0, 3);
  
  if (tomorrowDay == "Mon") {
   
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with moong dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with pachapayir sambar,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash"
    );
  }
  if (tomorrowDay == "Tue") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with toor dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with sambar,seasonal vegetable & paapad\n\n_Dinner_ \nMasala dosa with chutney "
    );
  }
  if (tomorrowDay == "Wed") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with rajma curry,seasonal vegetable & paapad\n\n_Dinner_ \nPhulka with panner butter masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with vathal kulambu,seasonal vegetable & paapad\n\n_Dinner_ \nIdly with sambar"
    );
  }
  if (tomorrowDay == "Thu") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with khadi,seasonal vegetable & paapad\n\n_Dinner_ \nChole batura\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with more kolambu,seasonal vegetable & paapad\n\n_Dinner_ \nchole batura"
    );
  }
  if (tomorrowDay == "Fri") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nAloo paratha with curd & pickle\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nCumin rice with gravy"
    );
  }
  if (tomorrowDay == "Sat") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with channa dhaal,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with matar paneer\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with kadala curry,seasonal vegetable & paapad\n\n_Dinner_ \nPuttu with kadala curry"
    );
  }
  if (tomorrowDay == "Sun") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala"
    );
  }
});





bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
