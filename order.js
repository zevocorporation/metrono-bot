const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const request = require("request");
const Markup = require("telegraf/markup");

const orderScene = new WizardScene(
  "OrderScene",
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
    const keyboard = new Keyboard();
    keyboard.add("South Indian", "North Indian").add("Home");
    ctx.reply("Help yourself with the cuisine", keyboard.draw());
    return ctx.wizard.next();
  },
  ctx => {
    if (
      ctx.message.text != "South Indian" &&
      ctx.message.text != "North Indian" &&
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

    if (ctx.wizard.state.orderFor == "Tomorrow") {
      ctx.wizard.state.cuisine = ctx.message.text;
      const keyboard = new Keyboard();
      keyboard.add("Breakfast", "Lunch", "Dinner").add("Home");
      ctx.reply("Choose your timing", keyboard.draw());
      return ctx.wizard.next();
    } else if (ctx.wizard.state.orderFor == "Today") {
      ctx.wizard.state.cuisine = ctx.message.text;
      const keyboard = new Keyboard();
      keyboard.add("Lunch", "Dinner").add("Home");
      ctx.reply("Name your timing", keyboard.draw());
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
        .add("My Plans", "My Account", "My Orders");
      ctx.reply("Choose an option!", keyboard.draw());

      return ctx.scene.leave();
    }
    if (ctx.message.text == "Lunch" && ctx.wizard.state.orderFor == "Today") {
      if (time > lunchTime) {
        const keyboard = new Keyboard();
        keyboard.add("Home");
        ctx.reply("Apologies! We have close lunch orders for today!", keyboard.draw());
        return ctx.wizard.next();
      }
    }
    if (ctx.message.text == "Dinner" && ctx.wizard.state.orderFor == "Today") {
      if (time > dinnerTime) {
        const keyboard = new Keyboard();
        keyboard.add("Home");
        ctx.reply("Apologies! We have close dinner orders for today!", keyboard.draw());
        return ctx.wizard.next();
      }
    }
    ctx.wizard.state.orderType = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("Regular", "Medium", "Jumbo").add("Home");
    ctx.reply("Choose your order size", keyboard.draw());
    return ctx.wizard.next();
  },

  ctx => {
    if (
      ctx.message.text != "Regular" &&
      ctx.message.text != "Medium" &&
      ctx.message.text != "Jumbo" &&
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

    ctx.wizard.state.size = ctx.message.text;
    const keyboard = new Keyboard();
    keyboard.add("1", "2", "3", "4", "5").add("Home");
    ctx.reply("What quantity would you prefer?", keyboard.draw());
    return ctx.wizard.next();
  },
  async ctx => {
    if (
      ctx.message.text != "1" &&
      ctx.message.text != "2" &&
      ctx.message.text != "3" &&
      ctx.message.text != "4" &&
      ctx.message.text != "5" &&
      ctx.message.text != "Home"
    ) {
      const keyboard = new Keyboard();
      keyboard
        .add("Wallet", "Menu")
        .add("Subscribe Plans", "Order Meals", "Order Addons")
        .add("My Plans", "My Account", "My Orders");
      ctx.reply("Please Choose from given options!", keyboard.draw());
      return ctx.scene.leave();
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

    var count = 0;

    let amount;
    const quantity = ctx.message.text;
    const orderFor = ctx.wizard.state.orderFor;
    const size = ctx.wizard.state.size;
    const orderType = ctx.wizard.state.orderType;
    const cuisine = ctx.wizard.state.cuisine;
    if (size == "Regular") amount = 10;
    else if (size == "Medium") amount = 100;
    else if (size == "Jumbo") amount = 120;

    amount = amount * parseInt(quantity);

    //set up headers for instamojo gateway
    var headers = {
      "X-Api-Key": "test_6bbdadf8c5089bf688f35b327b6",
      "X-Auth-Token": "test_b1526e3b6dd4a4863398f9b85ce"
    };

    //payload holds information about transaction
    var payload = {
      // required fields
      amount: `${amount}`,
      purpose: "metrono"
    };

    console.log(orderFor + " " + quantity + " " + size + " " + amount);

    //Check if user is in database
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
          ctx.wizard.state.userId = response.data.userexists._id;
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

    //Promise object to create an payment request and place an order

    var promise = new Promise(function(resolve, reject) {
      request.post(
        "https://test.instamojo.com/api/1.1/payment-requests/",
        { form: payload, headers: headers },
        function(error, response, body) {
          if (!error && response.statusCode == 201) {
            const temp = JSON.parse(body);
            // console.log("this"+temp.payment_request.id)
            ctx.wizard.state.paymentId = temp.payment_request.id;
            console.log(response.statusCode);
            const keyboard = new Keyboard();
            keyboard.add("/start");

            // ctx.reply(temp.payment_request.longurl)
            ctx.reply(`The amount of your order is ${amount}`, keyboard.draw());
            ctx.reply(
              `Complete your payment! or Go back!`,
              Markup.inlineKeyboard([
                Markup.urlButton(
                  "Make Payment",
                  `${temp.payment_request.longurl}`
                )
              ]).extra()
            );

            console.log(body);

            const orderMutation = {
              query: `
                                mutation
                                    {
                                    createOrder(orderInput:
                                    {
                                        cuisine:"${cuisine}",
                                        orderFor:"${orderFor}",
                                        
                                        orderType:"${orderType}",
                                        size:"${size + "-" + quantity}",
                                        orderStatus:"processing",
                                        deliveryStatus:"Packed",
                                        deliveryPartner:"Not assigned",
                                        paymentMode:"online",
                                        paymentId:"${temp.payment_request.id}",
                                        paymentStatus:"null",
                                        orderedUser:"${
                                          ctx.wizard.state.userId
                                        }",
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
                        `
            };

            fetch("https://metrono-backend.herokuapp.com/graphql", {
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
                console.log(response);
              })
              .catch(err => console.log(err));

            resolve(temp.payment_request.id);
          }
        }
      );
    });

    // to check and update payment Status
    await promise
      .then(function(res) {
        var interval = setInterval(function testOne() {
          count = count + 1;

          request.get(
            `https://test.instamojo.com/api/1.1/payment-requests/${res}/`,
            { headers: headers },
            function(error, response, body) {
              // console.log(response.statusCode);
              if (!error && response.statusCode == 200) {
                // console.log(response.statusCode);
                // console.log(body);

                const temp = JSON.parse(body);

                if (temp.payment_request.status == "Completed") {
                  if (temp.payment_request.payments[0].status == "Credit") {
                    const updatePaymentStatus = {
                      query: `
                                            mutation
                                                {
                                                updatePaymentStatus(paymentId:"${res}"){
                                                    _id
                                                }
                                                }


                                            `
                    };

                    fetch("https://metrono-backend.herokuapp.com/graphql", {
                      method: "POST",
                      body: JSON.stringify(updatePaymentStatus),
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
                        const keyboard = new Keyboard();
                        keyboard
                          .add("Wallet", "Menu")
                          .add("Subscribe Plans", "Order Meals", "Order Addons")
                          .add("My Plans", "My Account", "My Orders");
                        ctx.reply("Order Successful!", keyboard.draw());
                      })
                      .catch(err => console.log(err));

                    clearInterval(interval);
                  } else {
                    console.log("Order failed");
                    clearInterval(interval);
                  }
                }

                console.log("pending");
              }
            }
          );

          if (count > 120) {
            request.post(
              `https://test.instamojo.com/api/1.1/payment-requests/${res}/disable/`,
              { form: payload, headers: headers },
              function(error, response, body) {
                console.log(response.statusCode);
                if (!error && response.statusCode == 201) {
                  console.log(response.statusCode);
                }
              }
            );
            // ctx.reply("Session Expired try again");
            clearInterval(interval);
          }
        }, 3000);
      })
      .catch(function() {
        console.log("Some error has occured");
      });

    return ctx.scene.leave();
  }
);

exports.orderScene = orderScene;
