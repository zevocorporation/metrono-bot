const WizardScene=require('telegraf/scenes/wizard');
const Keyboard = require('telegraf-keyboard');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra')
const fetch = require('node-fetch');
// const Telegraf =require('telegraf');
// const bot =new Telegraf("1042039654:AAF6QoQG5Ten7_CMmGxSPymbh2FeLOfNSmk");


const menuScene=new WizardScene(
    'MenuScene',
    async ctx=>{


        let notRegistered=false;

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
  
    await fetch("http://localhost:4000/graphql", {
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
         notRegistered=true;
        }
  
       
      })
      .catch(err => console.log(err));
  

  if (notRegistered)
  {
    ctx.reply(
      "Sorry you have to register first!",
      Markup.inlineKeyboard([
        Markup.callbackButton("Register", "REGISTER_NOW")
      ]).extra()
    );

    return ctx.scene.leave();
  }

       
        ctx.reply('See the menu for ...',Markup.inlineKeyboard([
            [Markup.callbackButton('Today', 'TODAY'),
            Markup.callbackButton('Tomorrow', 'TOMORROW_MENU')],[Markup.urlButton('Download Menu','https://drive.google.com/file/d/1YMOpnNcStMSZX5HsbsL92pyCZc8yTMyH/view?usp=sharing')
        ]
          ]).extra());

          

        

          return ctx.scene.leave();



    }
)



exports.menuScene=menuScene;