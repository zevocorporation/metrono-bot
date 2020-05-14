const WizardScene = require("telegraf/scenes/wizard");
const Keyboard = require("telegraf-keyboard");
const fetch = require("node-fetch");
const request = require("request");
const Markup = require("telegraf/markup");

const helper = require("./helper");

const { startKeyboard } = helper;

const walletScene = new WizardScene(
  "WalletScene",
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
    keyboard.add("Check balance", "Recharge wallet").add("Home");
    ctx.reply("Check your balance or recharge your wallet", keyboard.draw());
    return ctx.wizard.next();
  },

  async (ctx) => {
    user = ctx.wizard.state.user;

    if (
      ctx.message.text != "Check balance" &&
      ctx.message.text != "Recharge wallet" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    if (ctx.message.text == "Check balance") {
      ctx.reply("Your credit balance is " + user.credits, startKeyboard.draw());
      return ctx.scene.leave();
    }

    if (ctx.message.text == "Recharge wallet") {
      const keyboard = new Keyboard();
      keyboard
        .add("100 Credits - Rs.119")
        .add("500 Credits - Rs.509")
        .add("1000 Credits - Rs.999")
        .add("Home");
      ctx.reply("Choose from Recharge options", keyboard.draw());
      return ctx.wizard.next();
    }
  },

  async (ctx) => {
    let amount;
    let credit;

    let count = 0;

    const user = ctx.wizard.state.user;

    if (
      ctx.message.text != "100 Credits - Rs.119" &&
      ctx.message.text != "500 Credits - Rs.509" &&
      ctx.message.text != "1000 Credits - Rs.999" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }

    const plan = ctx.message.text;

    if (plan == "100 Credits - Rs.119") {
      amount = 119;
      credit = 100;
    } else if (plan == "500 Credits - Rs.509") {
      amount = 509;
      credit = 500;
    } else if (plan == "1000 Credits - Rs.999") {
      amount = 999;
      credit = 1000;
    }

    credit = user.credits + credit;

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
            ctx.reply(`Your plan amount is Rs.${amount}`, keyboard.draw());
            ctx.reply(
              `Click below to Pay`,
              Markup.inlineKeyboard([
                Markup.urlButton(
                  "Make Payment",
                  `${temp.payment_request.longurl}`
                ),
              ]).extra()
            );
            console.log(body);

            const wallet = {
              query: `
                    mutation{
                        walletRecharge(walletInput:{plan:"${plan}",purchasedUser:"${user._id}",paymentId:"${temp.payment_request.id}",paymentStatus:"Pending"})
                          {
                            plan
                          }
                        }
                    `,
            };

            fetch("https://metrono-backend.herokuapp.com/graphql", {
              method: "POST",
              body: JSON.stringify(wallet),
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
                    const setCredits = {
                      query: `
                                mutation{
                                    setCredits(chatId:"${ctx.from.id}",credit:${credit})
                                    {
                                      _id
                                    }
                                  }


                                `,
                    };

                    const updateWalletPaymentStatus = {
                      query: `
                                    mutation{
                                        updateWalletPaymentStatus(paymentId:"${res}")
                                        {
                                          plan
                                        }
                                      }
                                    
                                    
                                    `,
                    };

                    fetch("https://metrono-backend.herokuapp.com/graphql", {
                      method: "POST",
                      body: JSON.stringify(updateWalletPaymentStatus),
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

                    fetch("https://metrono-backend.herokuapp.com/graphql", {
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
                      .then((response) => {
                        console.log(response);
                      })
                      .catch((err) => console.log(err));

                    const keyboard = new Keyboard();
                    keyboard
                      .add("Wallet", "Menu")
                      .add("Subscribe Plans", "Order Meals", "Order Addons")
                      .add("My Plans", "My Account", "My Orders");
                    ctx.reply(
                      "Recharge Successful! Let's back to your orders ",
                      keyboard.draw()
                    );
                    clearInterval(interval);
                  } else {
                    console.log("Recharge failed :(");
                    clearInterval(interval);
                  }
                }

                // console.log("pending");
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
);

exports.walletScene = walletScene;
