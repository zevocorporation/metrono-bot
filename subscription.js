const WizardScene = require("telegraf/scenes/wizard");
const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");
const request = require("request");
const Markup = require("telegraf/markup");

const helper = require("./helper");

const { startKeyboard } = helper;

const subscriptionScene = new WizardScene(
  "SubscriptionScene",
  async (ctx) => {
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

    ctx.wizard.state.user = user;
    const keyboard = new Keyboard();
    keyboard.add("7 day plan").add("28 day plan").add("Home");
    ctx.reply("Choose from plans given below", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "7 day plan" &&
      ctx.message.text != "28 day plan" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.plan = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("Regular").add("Medium").add("Jumbo").add("Home");
    ctx.reply("Select your pack size!", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "Regular" &&
      ctx.message.text != "Medium" &&
      ctx.message.text != "Jumbo" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.pack = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("North Indian").add("South Indian").add("Home");
    ctx.reply("Select a cuisine!", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "North Indian" &&
      ctx.message.text != "South Indian" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.cuisine = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("Breakfast").add("Lunch").add("Dinner").add("Home");
    ctx.reply("Select your meal", keyboard.draw());
    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text != "Breakfast" &&
      ctx.message.text != "Lunch" &&
      ctx.message.text != "Dinner" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    ctx.wizard.state.mealType = ctx.message.text;

    const keyboard = new Keyboard();
    keyboard.add("Pickup").add("Home Delivery").add("Home");
    ctx.reply("Select your delivery type", keyboard.draw());
    return ctx.wizard.next();
  },

  async (ctx) => {
    const user = ctx.wizard.state.user;

    if (
      ctx.message.text != "Pickup" &&
      ctx.message.text != "Home Delivery" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    const delivery = ctx.message.text;
    const mealType = ctx.wizard.state.mealType;

    let validity = 0;
    // let noPlanYet=false;

    const planExists = {
      query: `

      query
{

      getCurrentPlan(chatId:"${ctx.from.id}",mealType:"${mealType}")
      {
        plan
        createdAt
      }

    }
              
            `,
    };

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
      method: "POST",
      body: JSON.stringify(planExists),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log(res);
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(async (response) => {
        console.log(response);
        if (response.data.getCurrentPlan) {
          const today = new Date();
          const plandate = new Date(response.data.getCurrentPlan.createdAt);
          dayDifference = Math.floor(
            (today.getTime() - plandate.getTime()) / (1000 * 3600 * 24)
          );

          if (response.data.getCurrentPlan.plan == "7 day plan") {
            validity = 7 - dayDifference;
          } else if (response.data.getCurrentPlan.plan == "28 day plan") {
            validity = 28 - dayDifference;
          }
        }
      })
      .catch((err) => {
        throw err;
      });

    console.log(validity);

    if (validity > 0) {
      ctx.reply(
        `Your ${mealType}plan is still active. Cannot subscribe to new plan! \n You still have ${validity} days remaining `,
        startKeyboard.draw()
      );
      return ctx.scene.leave();
    } else {
      const plan = ctx.wizard.state.plan;
      let amount;
      const cuisine = ctx.wizard.state.cuisine;
      const pack = ctx.wizard.state.pack;

      var count = 0;

      if (plan == "7 day plan") {
        if (pack == "Regular") {
          if (mealType == "Breakfast") amount = 308;

          if (mealType == "Lunch") amount = 378;

          if (mealType == "Dinner") amount = 378;
        }
        if (pack == "Medium") {
          if (mealType == "Breakfast") amount = 343;

          if (mealType == "Lunch") amount = 413;

          if (mealType == "Dinner") amount = 413;
        }
        if (pack == "Jumbo") {
          if (mealType == "Breakfast") amount = 413;

          if (mealType == "Lunch") amount = 483;

          if (mealType == "Dinner") amount = 483;
        }
      }

      if (plan == "28 day plan") {
        if (pack == "Regular") {
          if (mealType == "Breakfast") amount = 952;

          if (mealType == "Lunch") amount = 1232;

          if (mealType == "Dinner") amount = 1232;
        }
        if (pack == "Medium") {
          if (mealType == "Breakfast") amount = 1092;

          if (mealType == "Lunch") amount = 1372;

          if (mealType == "Dinner") amount = 1372;
        }
        if (pack == "Jumbo") {
          if (mealType == "Breakfast") amount = 1372;

          if (mealType == "Lunch") amount = 1652;

          if (mealType == "Dinner") amount = 1652;
        }
      }

      console.log(
        plan + " " + cuisine + " " + pack + " " + mealType + " " + delivery
      );

      var headers = {
        "X-Api-Key": "test_6bbdadf8c5089bf688f35b327b6",
        "X-Auth-Token": "test_b1526e3b6dd4a4863398f9b85ce",
      };

      //payload holds information about transaction
      var payload = {
        // required fields
        amount: `${amount}`,
        purpose: "metrono",
      };

      var promise = new Promise(function (resolve, reject) {
        request.post(
          "https://test.instamojo.com/api/1.1/payment-requests/",
          { form: payload, headers: headers },
          function (error, response, body) {
            if (!error && response.statusCode == 201) {
              const temp = JSON.parse(body);
              // console.log("this"+temp.payment_request.id)
              ctx.wizard.state.paymentId = temp.payment_request.id;
              console.log(response.statusCode);
              // ctx.reply(temp.payment_request.longurl)
              const keyboard = new Keyboard();
              keyboard.add("/start");
              ctx.reply(`Your amount is${amount}`, keyboard.draw());
              ctx.reply(
                "Complete your payment",
                Markup.inlineKeyboard([
                  Markup.urlButton(
                    "Make Payment",
                    `${temp.payment_request.longurl}`
                  ),
                ]).extra()
              );
              ctx;
              console.log(body);

              const Subscription = {
                query: `
                                    mutation{
                                        createSubscription(subscriptionInput:{
                                          plan:"${plan}",
                                          cuisine:"${cuisine}",
                                          pack:"${pack}",
                                          mealType:"${mealType}",
                                          delivery:"${delivery}",
                                          subscribedUser:"${user._id}",
                                          paymentId:"${temp.payment_request.id}",
                                          paymentStatus:"Pending",
                                          chatId:"${ctx.from.id}"
                                        })
                                        {
                                          chatId
                                        }
                                      }
                                    
                                    `,
              };

              fetch("https://metrono-backend.herokuapp.com/graphql", {
                method: "POST",
                body: JSON.stringify(Subscription),
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
                  console.log(response);
                })
                .catch((err) => console.log(err));

              resolve(temp.payment_request.id);
            }
          }
        );
      });

      await promise
        .then((res) => {
          var interval = setInterval(function testOne() {
            count = count + 1;

            request.get(
              `https://test.instamojo.com/api/1.1/payment-requests/${res}/`,
              { headers: headers },
              function (error, response, body) {
                // console.log(response.statusCode);
                if (!error && response.statusCode == 200) {
                  // console.log(response.statusCode);
                  // console.log(body);

                  const temp = JSON.parse(body);

                  if (temp.payment_request.status == "Completed") {
                    if (temp.payment_request.payments[0].status == "Credit") {
                      const updatePaymentStatus = {
                        query: `
                                            mutation{
                                                updateSubscriptionPaymentStatus(paymentId:"${res}")
                                                {
                                                  _id
                                                }
                                              }
            
            
                                            `,
                      };

                      fetch("https://metrono-backend.herokuapp.com/graphql", {
                        method: "POST",
                        body: JSON.stringify(updatePaymentStatus),
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
                          console.log(response);
                        })
                        .catch((err) => console.log(err));

                      ctx.reply(
                        "Subscription Successful!",
                        startKeyboard.draw()
                      );
                      clearInterval(interval);
                    } else {
                      console.log("Recharge failed");
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
                function (error, response, body) {
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
        .catch((err) => {
          throw err;
        });

      return ctx.scene.leave();
    }
  }
);

exports.subscriptionScene = subscriptionScene;
