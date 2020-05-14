const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const Markup = require("telegraf/markup");

const helper = require("./helper");

const { startKeyboard } = helper;

const orderScene = new WizardScene(
  "OrderScene",
  async (ctx) => {
    user = await helper.verifyUser(ctx);

    if (!user) {
      ctx.reply(
        "Sorry! you got to register first",
        Markup.inlineKeyboard([
          Markup.callbackButton("Register", "REGISTER_NOW"),
        ]).extra()
      );

      return ctx.scene.leave();
    }

    ctx.wizard.state.user = user;
    const keyboard = new Keyboard();
    keyboard.add("Today", "Tomorrow").add("Home");
    ctx.reply("Select your day of order", keyboard.draw());
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text != "Today" &&
      ctx.message.text != "Tomorrow" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry, unrecognised input. Try again ", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.orderFor = ctx.message.text;
    const timingKeys = new Keyboard();

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      } // add zero in front of numbers < 10
      return i;
    }
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);

    const time = h + ":" + m + ":" + s;

    const lunchTime = "10:30:00";
    const dinnerTime = "17:30:00";

    if (ctx.message.text == "Today") {
      if (time < lunchTime) {
        timingKeys.add("Lunch", "Dinner").add("Home");
      } else if (time > lunchTime && time < dinnerTime) {
        ctx.reply("Lunch orders are closed by 10:30 am");
        timingKeys.add("Dinner").add("Home");
      } else if (time > lunchTime && time > dinnerTime) {
        ctx.reply(
          "Apologies! Today's Orders are closed. You can order for tommorrow"
        );
        return;
      }
    }

    if (ctx.message.text == "Tomorrow") {
      timingKeys.add("Breakfast", "Lunch", "Dinner").add("Home");
    }

    ctx.reply("Choose your timing", timingKeys.draw());
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text != "Breakfast" &&
      ctx.message.text != "Lunch" &&
      ctx.message.text != "Dinner" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry, unrecognised input. Try again ", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.orderType = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("North Indian", "South Indian").add("Home");
    ctx.reply("Choose your cuisine", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "North Indian" &&
      ctx.message.text != "South Indian" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry, unrecognised input. Try again ", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.cuisine = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("Regular", "Medium", "Jumbo").add("Home");
    ctx.reply("Choose your order size", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "Regular" &&
      ctx.message.text != "Medium" &&
      ctx.message.text != "Jumbo" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry, unrecognised input. Try again ", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.size = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("1", "2", "3", "4", "5").add("Home");
    ctx.reply("What quantity would you prefer?", keyboard.draw());
    return ctx.wizard.next();
  },
  async (ctx) => {
    let credits;

    if (
      ctx.message.text != "1" &&
      ctx.message.text != "2" &&
      ctx.message.text != "3" &&
      ctx.message.text != "4" &&
      ctx.message.text != "5" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry, unrecognised input. Try again ", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.quantity = ctx.message.text;

    if (ctx.wizard.state.size == "Regular") {
      if (ctx.wizard.state.orderType == "Breakfast") credits = 44;
      if (ctx.wizard.state.orderType == "Lunch") credits = 54;
      if (ctx.wizard.state.orderType == "Dinner") credits = 54;
    } else if (ctx.wizard.state.size == "Medium") {
      if (ctx.wizard.state.orderType == "Breakfast") credits = 49;
      if (ctx.wizard.state.orderType == "Lunch") credits = 59;
      if (ctx.wizard.state.orderType == "Dinner") credits = 59;
    } else if (ctx.wizard.state.size == "Jumbo") {
      if (ctx.wizard.state.orderType == "Breakfast") credits = 59;
      if (ctx.wizard.state.orderType == "Lunch") credits = 69;
      if (ctx.wizard.state.orderType == "Dinner") credits = 69;
    }

    credits = credits * parseInt(ctx.message.text);

    let addDeliveryCost = false;
    let date;

    if (ctx.wizard.state.orderFor == "Today") {
      const today = new Date();
      date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
    }

    if (ctx.wizard.state.orderFor == "Tomorrow") {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      date =
        tomorrow.getFullYear() +
        "-" +
        (tomorrow.getMonth() + 1) +
        "-" +
        tomorrow.getDate();
    }

    const requestBody = {
      query: `
              query{
                  addDeliveryCost(chatId:"${ctx.from.id}",orderType:"${ctx.wizard.state.orderType}",deliveryOn:"${date}")
                  
                }


              `,
    };

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
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
      .then((response) => {
        addDeliveryCost = response.data.addDeliveryCost;
      })
      .catch((err) => {
        throw err;
      });

    if (!addDeliveryCost) {
      credits = credits + 10;
      ctx.reply("You will be charged 10 credits for delivery");
    } else {
      ctx.reply(
        "You won't be charged extra for delivery since you already have an order at that time"
      );
    }

    ctx.wizard.state.credits = credits;

    const keyboard = new Keyboard();
    await ctx.reply(
      "You have ordered " +
        ctx.wizard.state.size +
        "-" +
        ctx.message.text +
        " " +
        ctx.wizard.state.cuisine +
        " " +
        ctx.wizard.state.orderType +
        " for " +
        ctx.wizard.state.orderFor
    );

    await ctx.reply(`Your order amount is ${credits} credits `);

    keyboard.add("Make Payment").add("Home");
    ctx.reply("Review order and make payment", keyboard.draw());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message.text != "Make Payment" && ctx.message.text != "Home") {
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());

      return ctx.scene.leave();
    }

    let credits = ctx.wizard.state.credits;
    const quantity = ctx.wizard.state.quantity;
    const orderFor = ctx.wizard.state.orderFor;
    const size = ctx.wizard.state.size;
    const orderType = ctx.wizard.state.orderType;
    const cuisine = ctx.wizard.state.cuisine;
    const user = ctx.wizard.state.user;

    if (user.credits < credits) {
      ctx.reply(
        `Not enough Credits to purchase! \n Credits needed : ${credits} \n Your current credit balance is ${user.credits}  `,
        startKeyboard.draw()
      );

      ctx.reply(
        "Click below to recharge",
        Markup.inlineKeyboard([
          Markup.callbackButton("Recharge Wallet", "RECHARGE_NOW"),
        ]).extra()
      );

      return ctx.scene.leave();
    } else {
      const updatedCredit = user.credits - credits;
      const setCredits = {
        query: `
                mutation{
                    setCredits(chatId:"${ctx.from.id}",credit:${updatedCredit})
                    {
                      _id
                    }
                  }


                `,
      };

      await fetch("https://metrono-backend.herokuapp.com/graphql", {
        method: "POST",
        body: JSON.stringify(setCredits),
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
          console.log(response);
          const orderMutation = {
            query: `
                    mutation
                        {
                        createOrder(orderInput:
                        {
                            cuisine:"${cuisine}",
                            orderFor:"${orderFor}",
                            
                            orderType:"${orderType}",
                            size:"${size}",
                            orderStatus:"Processing",
                            deliveryStatus:"Packed",
                            deliveryPartner:"Not assigned",
                            paymentMode:"Credit",
                            paymentId:"Null",
                            paymentStatus:"Paid",
                            orderedUser:"${user._id}",
                            chatId:"${ctx.from.id}",
                            addon:"Not applicable"
                            
                        })
                            {
                            _id
                        
                            orderedUser
                            {
                                _id
                            }
                            }
                        }
                `,
          };

          await fetch("https://metrono-backend.herokuapp.com/graphql", {
            method: "POST",
            body: JSON.stringify(orderMutation),
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
            .then((response) => {
              ctx.reply("Purchase Successful!", startKeyboard.draw());
              console.log(response);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }

    return ctx.scene.leave();
  }
);

exports.orderScene = orderScene;
