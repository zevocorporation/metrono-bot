const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const Markup = require("telegraf/markup");
const helper = require("./helper");

const { startKeyboard } = helper;

const addonScene = new WizardScene(
  "AddonScene",
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
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.orderFor = ctx.message.text;

    // add zero in front of numbers < 10
    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
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

    const timingKeys = new Keyboard();

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
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.orderType = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard
      .add("Chicken Gravy - 39 credits", "Single egg omlette - 10 credits")
      .add("Double egg omlette - 18 credits", "Chicken fry - 39 credits")
      .add("Home");
    ctx.reply("Select an item from the menu!", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "Chicken Gravy - 39 credits" &&
      ctx.message.text != "Single egg omlette - 10 credits" &&
      ctx.message.text != "Double egg omlette - 18 credits" &&
      ctx.message.text != "Chicken fry - 39 credits" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.addons = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("1", "2", "3").add("Home");
    ctx.reply("What quantity would you prefer ?", keyboard.draw());
    return ctx.wizard.next();
  },

  async (ctx) => {
    const addons = ctx.wizard.state.addons;
    let addon;

    if (
      ctx.message.text != "1" &&
      ctx.message.text != "2" &&
      ctx.message.text != "3" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.size = ctx.message.text;

    if (addons == "Chicken Gravy - 39 credits") {
      addonCredit = 39;
      addon = "Egg Masala";
    }
    if (addons == "Single egg omlette - 10 credits") {
      addonCredit = 10;
      addon = "Chicken Gravy";
    }
    if (addons == "Double egg omlette - 18 credits") {
      addonCredit = 18;
      addon = "Panner Tikka";
    }
    if (addons == "Chicken fry - 39 credits") {
      addonCredit = 39;
      addon = "Panner Butter Masala";
    }

    ctx.wizard.state.addon = addon;

    addonCredit = addonCredit * parseInt(ctx.message.text);

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
      addonCredit = addonCredit + 10;
      ctx.reply("You will be charged 10 credits for delivery");
    } else {
      ctx.reply(
        "You won't be charged extra for delivery since you already have an order at that time"
      );
    }

    ctx.wizard.state.addonCredit = addonCredit;

    await ctx.reply(
      "You have ordered " +
        ctx.message.text +
        " " +
        ctx.wizard.state.addons +
        " for " +
        ctx.wizard.state.orderFor +
        " " +
        ctx.wizard.state.orderType
    );
    await ctx.reply(`Your order amount is ${addonCredit} credits `);

    const keyboard = new Keyboard();
    keyboard.add("Make Payment").add("Home");
    ctx.reply("Review order and Make your payment", keyboard.draw());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (ctx.message.text != "Make Payment" && ctx.message.text != "Home") {
      ctx.reply("Sorry! unrecognised option. Try again", startKeyboard.draw());

      return ctx.scene.leave();
    }

    let addon = ctx.wizard.state.addon;

    const size = ctx.wizard.state.size;
    const orderFor = ctx.wizard.state.orderFor;
    const orderType = ctx.wizard.state.orderType;
    let addonCredit = ctx.wizard.state.addonCredit;
    let user = ctx.wizard.state.user;

    if (user.credits < addonCredit) {
      ctx.reply(
        `Not enough Credits to purchase! \n Credits needed : ${addonCredit} \n Your current credit balance is ${user.credits}  `,
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
      const updatedCredit = user.credits - addonCredit;
      const updateCredits = {
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
        body: JSON.stringify(updateCredits),
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
                            cuisine:"Not applicable",
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
                            addon:"${addon}"
                            
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

exports.addonScene = addonScene;
