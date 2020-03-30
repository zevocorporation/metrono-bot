const WizardScene=require('telegraf/scenes/wizard');
const Keyboard = require('telegraf-keyboard');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra')
// const Telegraf =require('telegraf');
// const bot =new Telegraf("1042039654:AAF6QoQG5Ten7_CMmGxSPymbh2FeLOfNSmk");


const menuScene=new WizardScene(
    'MenuScene',
    ctx=>{

       
        ctx.reply('See the menu for ...',Markup.inlineKeyboard([
            [Markup.callbackButton('Today', 'TODAY'),
            Markup.callbackButton('Tomorrow', 'TOMORROW_MENU')],[Markup.urlButton('Download Menu','https://drive.google.com/file/d/1YMOpnNcStMSZX5HsbsL92pyCZc8yTMyH/view?usp=sharing')
        ]
          ]).extra());

          

        

          return ctx.scene.leave();



    }
)



exports.menuScene=menuScene;