const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const Markup = require("telegraf/markup");

const helper = require("./helper");

const { startKeyboard } = helper;

const myplanScene = new WizardScene("MyPlanScene", async (ctx) => {
  user = await helper.verifyUser(ctx);

  if (!user) {
    ctx.reply(
      "Sorry! You got to register first!",
      Markup.inlineKeyboard([
        Markup.callbackButton("Register", "REGISTER_NOW"),
      ]).extra()
    );

    return ctx.scene.leave();
  }

  let subscriptions;

  const plan = {
    query: `
            query{
                getPlanDetails(chatId:"${ctx.from.id}")
                {
                  plan
                  cuisine
                  createdAt
                  mealType
                  
                }
              }
              
            `,
  };

  await fetch("https://metrono-backend.herokuapp.com/graphql", {
    method: "POST",
    body: JSON.stringify(plan),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      return res.json();
    })
    .then(async (response) => {
      subscriptions = response.data.getPlanDetails;
    })
    .catch((err) => {
      throw err;
    });

  if (subscriptions.length == 0) {
    ctx.reply(
      "You aren't subscribed to any of our plans",
      startKeyboard.draw()
    );
    ctx.reply(
      "Click below to get onboard!",
      Markup.inlineKeyboard([
        Markup.callbackButton("Subscribe", "SUBSCRIBE_NOW"),
      ]).extra()
    );

    return ctx.scene.leave();
  }

  ctx.reply("Subscribed Plans");
  for (i = 0; i < subscriptions.length; i++) {
    const today = new Date();
    const plandate = new Date(subscriptions[i].createdAt);
    dayDifference = Math.floor(
      (today.getTime() - plandate.getTime()) / (1000 * 3600 * 24)
    );

    console.log(dayDifference);

    let validity;

    if (subscriptions[i].plan == "7 day plan") validity = 7 - dayDifference;
    if (subscriptions[i].plan == "28 day plan") validity = 28 - dayDifference;

    if (validity <= 0) {
      await ctx.reply(
        "Your " +
          subscriptions[i].cuisine +
          " " +
          subscriptions[i].mealType +
          " subscription will expire has expired",
        Markup.inlineKeyboard([
          Markup.callbackButton("Subscribe", "SUBSCRIBE_NOW"),
        ]).extra()
      );
    } else {
      await ctx.reply(
        "Your " +
          subscriptions[i].cuisine +
          " " +
          subscriptions[i].mealType +
          " subscription will expire in " +
          validity +
          " days"
      );
    }
  }

  return ctx.scene.leave();
});

exports.myplanScene = myplanScene;
