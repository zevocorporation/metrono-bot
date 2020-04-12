const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const Markup = require("telegraf/markup");

const addonScene = new WizardScene(
  "AddonScene",
  async ctx => {
    let notRegistered = false;

    const userExists = {
      query: `
          query
          {
            userexists(chatId:"${ctx.from.id}"){
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
        if (!response.data.userexists) {
          notRegistered = true;
        }
      })
      .catch(err => console.log(err));

    if (notRegistered) {
      ctx.reply(
        "Sorry you have to register first!",
        Markup.inlineKeyboard([
          Markup.callbackButton("Register", "REGISTER_NOW")
        ]).extra()
      );

      return ctx.scene.leave();
    }

    const keyboard = new Keyboard();
    keyboard.add("Today", "Tomorrow").add("Home");
    ctx.reply("Select your day of order", keyboard.draw());
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
        .add("My Plans", "My Account", "My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    ctx.wizard.state.orderFor = ctx.message.text;
    const timingKeys = new Keyboard();

    function checkTime(i) {
      if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
      return i;
    }
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    h=checkTime(h)
    m = checkTime(m);
    s = checkTime(s);
    // const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const time= h + ":" + m + ":" + s;
    // console.log(time);
    const lunchTime = "10:30:00";
    const dinnerTime = "17:30:00";

    if (ctx.message.text=="Today")
    {
      if (time<lunchTime)
      {
        timingKeys.add("Lunch","Dinner").add("Home")
      }
      else if (time > lunchTime && time <dinnerTime)
      {
        ctx.reply("Lunch orders are closed by 10:30 am")
        timingKeys.add("Dinner").add("Home")
      }
      else if (time > lunchTime && time > dinnerTime)
      {
        
        ctx.reply("Apologies! Today's Orders are closed. You can order for tommorrow");
        return ;
      }
    }

    if (ctx.message.text=="Tomorrow")
    {
      timingKeys.add("Breakfast","Lunch","Dinner").add("Home")
    }

   
    ctx.reply("Choose your timing", timingKeys.draw());
    return ctx.wizard.next();
  },

  ctx => {
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
        .add("My Plans", "My Account", "My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }


    ctx.wizard.state.orderType=ctx.message.text;
    const keyboard = new Keyboard();
    keyboard
      .add("Egg Masala 100 credits", "Chicken Gravy 200 Credits")
      .add("Panner Tikka 150 Credits", "Panner Butter Masala 250 Credits")
      .add("Home");
    ctx.reply("Select an item from the menu!", keyboard.draw());
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
        .add("My Plans", "My Account","My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }
    

   
    ctx.wizard.state.addons = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("1", "2", "3").add("Home");
    ctx.reply("What quantity would you prefer ?", keyboard.draw());
    return ctx.wizard.next();
  },

  ctx => {
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
        .add("My Plans", "My Account","My Orders");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.scene.leave();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account","My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    ctx.wizard.state.size = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("Make Payment").add("Home");
    ctx.reply("Continue or go back", keyboard.draw());
    return ctx.wizard.next();
  },

  async ctx => {
    if (ctx.message.text != "Make Payment" && ctx.message.text != "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account","My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    if (ctx.message.text == "Home") {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account","My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }

    let userId;
    let addon;

    const size = ctx.wizard.state.size;
    const orderFor = ctx.wizard.state.orderFor;
    const orderType = ctx.wizard.state.orderType;
    const addons = ctx.wizard.state.addons;
    let addonCredit;
    let userCredit;

    if (addons == "Egg Masala 100 credits") {
      addonCredit = 100;
      addon = "Egg Masala";
    }
    if (addons == "Chicken Gravy 200 Credits") {
      addonCredit = 200;
      addon = "Chicken Gravy";
    }
    if (addons == "Panner Tikka 150 Credits") {
      addonCredit = 150;
      addon = "Panner Tikka";
    }
    if (addons == "Panner Butter Masala 250 Credits") {
      addonCredit = 250;
      addon = "Panner Butter Masala";
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

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
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

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
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
        .add("My Plans", "My Account","My Orders");

      ctx.reply(
        `Not enough Credits to purchase! \n Credits needed : ${addonCredit} \n Your current credit balance is ${userCredit}  `,
        keyboard.draw()
      );

        ctx.reply("Click below to recharge",
        Markup.inlineKeyboard([
          Markup.callbackButton("Recharge Wallet", "RECHARGE_NOW")
        ]).extra())

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

      await fetch("https://metrono-backend.herokuapp.com/graphql", {
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
        .then(async response => {
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
                            orderedUser:"${userId}",
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
                `
          };

          await fetch("https://metrono-backend.herokuapp.com/graphql", {
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