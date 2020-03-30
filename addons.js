const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const Markup = require("telegraf/markup");

const addonScene = new WizardScene(
  "AddonScene",
  ctx => {
    const keyboard = new Keyboard();
    keyboard.add("Today", "Tomorrow").add("Home");
    ctx.reply("Purchase addons for...", keyboard.draw());
    return ctx.wizard.next();
  },
  ctx => {
    if (
      ctx.message.text != "Today" &&
      ctx.message.text != "Tomorrow" &&
      ctx.message.text != "Home"
    ) {
      const keyboard = new Keyboard();
      keyboard.add("Home");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.wizard.next();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }
    ctx.wizard.state.orderFor = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard
      .add("Egg Masala 100 credits", "Chicken Gravy 200 Credits")
      .add("Panner Tikka 150 Credits", "Panner Butter Masala 250 Credits")
      .add("Home");
    ctx.reply("Choose your Addon", keyboard.draw());
    return ctx.wizard.next();
  },

  ctx => {
    if (
      ctx.message.text != "Egg Masala 100 credits" &&
      ctx.message.text != "Chicken Gravy 200 Credits" &&
      ctx.message.text != "Panner Tikka 150 Credits" &&
      ctx.message.text != "Panner Butter Masala 250 Credits" &&
      ctx.message.text != "Home"
    ) {
      const keyboard = new Keyboard();
      keyboard.add("Home");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.wizard.next();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }
    if (ctx.wizard.state.orderFor == "Tomorrow") {
      ctx.wizard.state.addons = ctx.message.text;
      const keyboard = new Keyboard();
      keyboard.add("Breakfast", "Lunch", "Dinner").add("Home");
      ctx.reply("Choose your timing", keyboard.draw());
      return ctx.wizard.next();
    } else if (ctx.wizard.state.orderFor == "Today") {
      ctx.wizard.state.addons = ctx.message.text;
      const keyboard = new Keyboard();
      keyboard.add("Lunch", "Dinner").add("Home");
      ctx.reply("Choose your timing", keyboard.draw());
      return ctx.wizard.next();
    }
  },

  ctx => {
    const today = new Date();
    const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const lunchTime = "10:30:00";
    const dinnerTime = "17:30:00";

    if (
      ctx.message.text != "Breakfast" &&
      ctx.message.text != "Lunch" &&
      ctx.message.text != "Dinner" &&
      ctx.message.text != "Home"
    ) {
      const keyboard = new Keyboard();
      keyboard.add("Home");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.wizard.next();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    if (ctx.message.text == "Lunch" && ctx.wizard.state.orderFor == "Today") {
      if (time > lunchTime) {
        const keyboard = new Keyboard();
        keyboard.add("Home");
        ctx.reply("Lunch orders are Closed!", keyboard.draw());
        return ctx.wizard.next();
      }
    }
    if (ctx.message.text == "Dinner" && ctx.wizard.state.orderFor == "Today") {
      if (time > dinnerTime) {
        const keyboard = new Keyboard();
        keyboard.add("Home");
        ctx.reply("Dinner orders are Closed!", keyboard.draw());
        return ctx.wizard.next();
      }
    }
    ctx.wizard.state.orderType = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("1", "2", "3").add("Home");
    ctx.reply("Choose Quantity...", keyboard.draw());
    return ctx.wizard.next();
  },

  async ctx => {
    if (
      ctx.message.text != "1" &&
      ctx.message.text != "2" &&
      ctx.message.text != "3" &&
      ctx.message.text != "Home"
    ) {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.scene.leave();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    let userId;
    let cuisine;

    const size = ctx.message.text;
    const orderFor = ctx.wizard.state.orderFor;
    const orderType = ctx.wizard.state.orderType;
    const addons = ctx.wizard.state.addons;
    let addonCredit;
    let userCredit;

    if (addons == "Egg Masala 100 credits") {
      addonCredit = 100;
      cuisine = "Egg Masala";
    }
    if (addons == "Chicken Gravy 200 Credits") {
      addonCredit = 200;
      cuisine = "Chicken Gravy";
    }
    if (addons == "Panner Tikka 150 Credits") {
      addonCredit = 150;
      cuisine = "Panner Tikka";
    }
    if (addons == "Panner Butter Masala 250 Credits") {
      addonCredit = 250;
      cuisine = "Panner Butter Masala";
    }

    addonCredit = addonCredit * parseInt(size);

    // ctx.reply(`Total credit needed: ${addonCredit} to purchase`)
    console.log(addonCredit);

    const userIdQuery = {
      query: `
            query
            {
              userexists(chatId:"${ctx.from.id}"){
                _id
              }
            }
     `
    };

    await fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(userIdQuery),
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
        if (response.data.userexists !== null) {
          console.log(response);
          userId = response.data.userexists._id;
        } else {
          ctx.reply(
            "click the below button to register!",
            Markup.inlineKeyboard([
              Markup.callbackButton("Register", "REGISTER_NOW")
            ]).extra()
          );
        }
      })
      .catch(err => {
        console.log(err);
        throw err;
      });

    const getCredits = {
      query: `

                query
                {
                getCredits(chatId:"${ctx.from.id}")
                
                }
            
            
            `
    };

    await fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(getCredits),
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
        userCredit = response.data.getCredits;
      })
      .catch(err => {
        console.log(err);
        ctx.reply("Something went Wrong! :(");
        throw err;
      });

    if (userCredit < addonCredit) {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account");

      ctx.reply(
        `Not enough Credits to purchase! Your current credit balance is ${userCredit}  `,
        keyboard.draw()
      );
      return ctx.scene.leave();
    } else {
      const updatedCredit = userCredit - addonCredit;
      const updateCredits = {
        query: `
                mutation{
                    setCredits(chatId:"${ctx.from.id}",credit:${updatedCredit})
                    {
                      _id
                    }
                  }


                `
      };

      await fetch("http://localhost:4000/graphql", {
        method: "POST",
        body: JSON.stringify(updateCredits),
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
                            orderStatus:"Recieved",
                            deliveryStatus:"Packed",
                            deliveryPartner:"Not assigned",
                            paymentMode:"Credit",
                            paymentId:"Null",
                            paymentStatus:"Paid",
                            orderedUser:"${userId}"
                            
                        })
                            {
                            _id
                        
                            orderedUser
                            {
                                _id
                            }
                            }
                        }
                `
          };

          fetch("http://localhost:4000/graphql", {
            method: "POST",
            body: JSON.stringify(orderMutation),
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
              const keyboard = new Keyboard();
              keyboard
                .add("Wallet", "Menu")
                .add("Subscribe Plans", "Order Meals", "Order Addons")
                .add("My Plans", "My Account");
              ctx.reply("Purchase Successful!", keyboard.draw());
              console.log(response);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }

    return ctx.scene.leave();
  }
);

exports.addonScene = addonScene;
