const WizardScene=require('telegraf/scenes/wizard');
const fetch = require('node-fetch');
const Keyboard = require('telegraf-keyboard');
const Markup = require('telegraf/markup')


const myplanScene= new WizardScene(
    'MyPlanScene',
    async ctx=>{
        let planActive=false;

        ctx.reply("Current plan details:")

        const plan={

            query:`
            query{
                getPlanDetails(chatId:"${ctx.from.id}")
                {
                  plan
                  cuisine
                  createdAt
                  
                }
              }
              
            `



        }

        await fetch('http://localhost:4000/graphql',{
            method:'POST',
            body:JSON.stringify(plan),
            headers:
            {
                'Content-Type':'application/json'
            }
        }).then(res=>{
            if (res.status !== 200 && res.status !==201)
            {
                throw new Error("Failed!");
            }
            return res.json();
        }).then(async (response)=> {
            console.log(response);

            if(response.data.getPlanDetails)
            {
                const today=new Date();
                const plandate=new Date(response.data.getPlanDetails.createdAt);
                validity=Math.floor((today.getTime()-plandate.getTime())/(1000*3600*24));
                
                await ctx.reply("Your  plan "+response.data.getPlanDetails.plan+"\n Cuisine : "+response.data.getPlanDetails.cuisine +" \n Subscribed on :"+response.data.getPlanDetails.createdAt )
                if(response.data.getPlanDetails.plan=="7 day plan")
                {
                    if(7-validity>0)
                    {
                        ctx.reply(`Your plan validity is ${7-validity} days`)
                        const keyboard=new Keyboard();
                        keyboard.add("Change cuisine").add("Home");
                        ctx.reply("Click below button to change cuisine",keyboard.draw());
                        planActive=true;
                        
                        
                    }
                    else
                    {
                        ctx.reply(`Your plan has expired! \n Subscribe again`)
                    }
                    
                }
                else if(response.data.getPlanDetails.plan=="28 day plan")
                {
                    if(28-validity>0)
                    {
                        ctx.reply(`Your plan validity is ${28-validity} days`)
                        const keyboard=new Keyboard();
                        keyboard.add("Change cuisine").add("Home");
                        ctx.reply("Click below button to change cuisine",keyboard.draw());
                        planActive=true;
                        

                    }

                    else
                    {
                        const keyboard=new Keyboard();
                        keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');

                        ctx.reply(`Your plan has expired! \n Subscribe again`,keyboard.draw())
                        return ctx.scene.leave();
                    }
                }
                

            }
            else
            {
                const keyboard=new Keyboard();
                keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');

                ctx.reply("You are not subscribed to any plan!",keyboard.draw())
                
            }

            
            
        }).catch( err => 
            {console.log(err)
        throw err;}
        )



        if(planActive)
        {
            return ctx.wizard.next();
        }
        else
        {
            return ctx.scene.leave();
        }
        
        
        
        



    },
    ctx=>
    {
        

        if(ctx.message.text!="Change cuisine" && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Please Choose from given options!",keyboard.draw())
            return ctx.scene.leave();
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

        else
        {
            const keyboard=new Keyboard();
            keyboard.add("South Indian","North Indian").add("Home");
            ctx.reply("choose a cuisine!",keyboard.draw())
            return ctx.wizard.next();
        }
        
    },
    async ctx=>{

        if(ctx.message.text!="South Indian" && ctx.message.text!="North Indian" && ctx.message.text!="Home")
        {
            const keyboard=new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Please Choose from given options!",keyboard.draw())
            return ctx.scene.leave();
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

        else
        {
            const cuisine=ctx.message.text;
            const changeCuisine={
                query:`
                mutation{
                    changeCuisine(chatId:"${ctx.from.id}",cuisine:"${cuisine}")
                    {
                      cuisine
                    }
                  }
                
                `
                
            }


            await fetch('http://localhost:4000/graphql',{
                method:'POST',
                body:JSON.stringify(changeCuisine),
                headers:
                {
                    'Content-Type':'application/json'
                }
            }).then(res=>{
                if (res.status !== 200 && res.status !==201)
                {
                    throw new Error("Failed!");
                }
                return res.json();
            }).then(response=> {
                const keyboard=new Keyboard();
                keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
                ctx.reply(`Cuisine Changed \n Current Cusine: ${response.data.changeCuisine.cuisine}`,keyboard.draw())
                
                
            }).catch( err => 
                {console.log(err)
            throw err;})

            return ctx.scene.leave();
        }

    }

)

exports.myplanScene=myplanScene;