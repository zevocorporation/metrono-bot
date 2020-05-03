const WizardScene = require("telegraf/scenes/wizard");
const Keyboard = require("telegraf-keyboard");
const fetch = require("node-fetch");
const Markup = require("telegraf/markup");

const accountScene = new WizardScene(
  "AccountScene",
  async (ctx) => {
    let notRegistered = false;

    const user = {
      query: `

            query
                {
                userexists(chatId:"${ctx.from.id}")
                {
                    name
                    mobile
                    address
                    email
                }
                
                }
            
            
            `,
    };

    await fetch("https://metrono-backend.herokuapp.com/graphql", {
      method: "POST",
      body: JSON.stringify(user),
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
        if (response.data.userexists) {
          ctx.reply(
            `Current Account details: \n Name : ${response.data.userexists.name} \n Mobile : ${response.data.userexists.mobile} \n Email : ${response.data.userexists.email} \n Address : ${response.data.userexists.address} `
          );
        } else {
          ctx.reply(
            "Sorry you have to register first!",
            Markup.inlineKeyboard([
              Markup.callbackButton("Register", "REGISTER_NOW"),
            ]).extra()
          );

          notRegistered = true;
        }
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Something went Wrong! :(");
        throw err;
      });

    if (notRegistered) {
      return ctx.scene.leave();
    }

    const keyboard = new Keyboard();
    keyboard
      .add("Change mobile number")
      .add("Change delivery address")
      .add("Change email")
      .add("Home");
    ctx.reply("Change your address ,mobile and email...", keyboard.draw());

    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text != "Change mobile number" &&
      ctx.message.text != "Change delivery address" &&
      ctx.message.text != "Change email" &&
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
        const keyboard = new Keyboard();
        keyboard
          .add("Wallet", "Menu")
          .add("Subscribe Plans", "Order Meals", "Order Addons")
          .add("My Plans", "My Account", "My Orders");
        ctx.reply("Please Enter a valid Mobile number", keyboard.draw());

        return ctx.scene.leave();
      }

      for (i = 0; i < 10; i++) {
        if (
          (changeData[i] >= "a" && changeData[i] <= "z") ||
          (changeData[i] >= "A" && changeData[i] <= "Z")
        ) {
          const keyboard = new Keyboard();
          keyboard
            .add("Wallet", "Menu")
            .add("Subscribe Plans", "Order Meals", "Order Addons")
            .add("My Plans", "My Account", "My Orders");
          ctx.reply("Please Enter a valid Mobile number", keyboard.draw());
          return ctx.scene.leave();
        }
      }
    }
    if (changeDetail == "email") {
      if (!changeData.includes("@")) {
        const keyboard = new Keyboard();
        keyboard
          .add("Wallet", "Menu")
          .add("Subscribe Plans", "Order Meals", "Order Addons")
          .add("My Plans", "My Account", "My Orders");
        ctx.reply("Please Enter a valid Email", keyboard.draw());

        return ctx.scene.leave();
      }
      if (!changeData.includes(".")) {
        const keyboard = new Keyboard();
        keyboard
          .add("Wallet", "Menu")
          .add("Subscribe Plans", "Order Meals", "Order Addons")
          .add("My Plans", "My Account", "My Orders");
        ctx.reply("Please Enter a valid Email");

        return ctx.scene.leave();
      }
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
        const keyboard = new Keyboard();
        keyboard
          .add("Wallet", "Menu")
          .add("Subscribe Plans", "Order Meals", "Order Addons")
          .add("My Plans", "My Account", "My Orders");

        ctx.reply("Your details are updated!", keyboard.draw());
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
