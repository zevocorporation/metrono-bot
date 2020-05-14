const fetch = require("node-fetch");
const Keyboard = require("telegraf-keyboard");

exports.verifyUser = async function (ctx) {
  let user = false;

  const userExists = {
    query: `
            query
            {
              userexists(chatId:"${ctx.from.id}"){
                _id
                name
                email
                mobile
                credits
                address
              }
            }
            `,
  };

  //Send request to graphql api about current user

  await fetch("https://metrono-backend.herokuapp.com/graphql", {
    method: "POST",
    body: JSON.stringify(userExists),
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
      // console.log(response)
      //If user is already in database . Show order Button
      if (response.data.userexists) {
        user = response.data.userexists;
      }
    })
    .catch((err) => console.log(err));

  if (user) return user;
  else return false;
};

const startKeyboard = new Keyboard();

startKeyboard
  .add("Wallet", "Menu")
  .add("Subscribe Plans", "Onetime order", "Order Addons")
  .add("My Plans", "My Account", "My Orders");

exports.startKeyboard = startKeyboard;

exports.connString = "https://metrono-backend.herokuapp.com/graphql";
