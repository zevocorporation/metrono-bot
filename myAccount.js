const WizardScene = require("telegraf/scenes/wizard");
const Keyboard = require("telegraf-keyboard");
const fetch = require("node-fetch");
const Markup = require("telegraf/markup");
const helper = require("./helper");


const { startKeyboard }= helper;

const accountScene = new WizardScene(
  "AccountScene",
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

    ctx.reply(
      `Current Account details: \n Name : ${user.name} \n Mobile : ${user.mobile} \n Email : ${user.email} \n Address : ${user.address} `
    );

    const keyboard = new Keyboard();
    keyboard
      .add("Change mobile number")
      .add("Change delivery address")
      .add("Change email")
      .add("Home");
    ctx.reply("Change your address ,mobile and email...", keyboard.draw());

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (
      ctx.message.text != "Change mobile number" &&
      ctx.message.text != "Change delivery address" &&
      ctx.message.text != "Change email" &&
      ctx.message.text != "Home"
    ) {
      ctx.reply("Sorry! unrecognised input. Try again", startKeyboard.draw());
      return ctx.scene.leave();
    }
    
    if (ctx.message.text == "Change mobile number") {
      ctx.wizard.state.changeDetail = "mobile";
      ctx.reply("Enter new mobile number", Markup.removeKeyboard().extra());
      return ctx.wizard.next();
    }

    if (ctx.message.text == "Change delivery address") {
      ctx.wizard.state.changeDetail = "address";
      ctx.reply("Enter new delivery address", Markup.removeKeyboard().extra());
      return ctx.wizard.next();
    }

    if (ctx.message.text == "Change email") {
      ctx.wizard.state.changeDetail = "email";
      ctx.reply("Enter new email address", Markup.removeKeyboard().extra());
      return ctx.wizard.next();
    }
  },
  async (ctx) => {
    const changeDetail = ctx.wizard.state.changeDetail;
    const changeData = ctx.message.text;

    if (changeDetail == "mobile") {
      if (changeData.length != 10) {
        ctx.reply("Please Enter a valid Mobile number", startKeyboard.draw());

        return ctx.scene.leave();
      }

      for (i = 0; i < 10; i++) {
        if (
          (changeData[i] >= "a" && changeData[i] <= "z") ||
          (changeData[i] >= "A" && changeData[i] <= "Z")
        ) {
          ctx.reply("Please Enter a valid Mobile number", startKeyboard.draw());
          return ctx.scene.leave();
        }
      }
    }
    if (changeDetail == "email") {
      if (!changeData.includes("@")) {
        ctx.reply("Please Enter a valid Email", startKeyboard.draw());

        return ctx.scene.leave();
      }
      if (!changeData.includes(".")) {
        ctx.reply("Please Enter a valid Email", startKeyboard.draw());

        return ctx.scene.leave();
      }
    }

  

    const updateUser = {
      query: `

            mutation{
                updateUser(chatId:"${ctx.from.id}",changeDetail:"${changeDetail}",changeData:"${changeData}")
                {
                  
                  mobile
                  address
                  email
                }
              }
            `,
    };

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
      method: "POST",
      body: JSON.stringify(updateUser),
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

        ctx.reply("Your details are updated!", startKeyboard.draw());
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Something went Wrong! :( Try again");
        throw err;
      });

    return ctx.scene.leave();
  }
);

exports.accountScene = accountScene;
