const WizardScene=require('telegraf/scenes/wizard');
const fetch = require('node-fetch');
const Keyboard = require('telegraf-keyboard');
const request =require('request');
const Markup = require('telegraf/markup')


const subscriptionScene= new WizardScene(
    'SubscriptionScene',
   async ctx=>
    {

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

        const keyboard=new Keyboard;
        keyboard.add("7 day plan").add("28 day plan").add("Home");
        ctx.reply("Choose from plans given below",keyboard.draw());
        return ctx.wizard.next();
    },

    ctx=>{
        if(ctx.message.text!="7 day plan" && ctx.message.text!="28 day plan"  && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add("Home");
            ctx.reply("Please Choose from given plans!",keyboard.draw());
            return ctx.wizard.next();
            
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }
        if(ctx.message.text=="7 day plan")
        {
            ctx.wizard.state.plan="7 day plan";
            // ctx.wizard.state.amount=699;

        }
        else if(ctx.message.text=="28 day plan")
        {
            ctx.wizard.state.plan="28 day plan";
            // ctx.wizard.state.amount=3000;
        }

        const keyboard=new Keyboard;
        keyboard.add("Regular").add("Medium").add("Jumbo").add("Home");
        ctx.reply("Select your pack size!",keyboard.draw());
        return ctx.wizard.next();
        




    },

    ctx=>{

        if(ctx.message.text!="Regular" && ctx.message.text!="Medium"  && ctx.message.text!="Jumbo" && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add("Home");
             ctx.reply("Please Choose from given plans!",keyboard.draw());
             return ctx.wizard.next();
            
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

        ctx.wizard.state.pack=ctx.message.text;

        const keyboard=new Keyboard;
        keyboard.add("North Indian").add("South Indian").add("Home");
        ctx.reply("Select a cuisine!",keyboard.draw());
        return ctx.wizard.next();

    },



    ctx=>
    {
        if(ctx.message.text!="North Indian" && ctx.message.text!="South Indian"  && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
             ctx.reply("Please Choose from given plans!",keyboard.draw());
            return ctx.scene.leave();
            
        }
        
        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }
        if(ctx.message.text=="North Indian")
        {
            ctx.wizard.state.cuisine="North Indian"
        }

        if(ctx.message.text=="South Indian")
        {
            ctx.wizard.state.cuisine="South Indian"
        }
        const keyboard=new Keyboard;
        keyboard.add("Pickup").add("Home Delivery").add("Home");
        ctx.reply("Select your delivery type",keyboard.draw());
        return ctx.wizard.next();

    },

    async ctx=>{

        let delivery;

        if(ctx.message.text!="Pickup" && ctx.message.text!="Home Delivery"  && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
             ctx.reply("Please Choose from given plans!",keyboard.draw());
            return ctx.scene.leave();
            
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

        if(ctx.message.text=="Pickup")
        {
            delivery="Pickup"
        }

        if(ctx.message.text=="Home Delivery")
        {
            delivery="Home Delivery"
        }

        


        let validity=0;
        // let noPlanYet=false;

        const planExists={

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

        await fetch('https://metrono-backend.herokuapp.com/graphql',{
            method:'POST',
            body:JSON.stringify(planExists),
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
                dayDifference=Math.floor((today.getTime()-plandate.getTime())/(1000*3600*24));

                if(response.data.getPlanDetails.plan=="7 day plan")
                {
                   validity=7-dayDifference; 
                    
                }
                else if(response.data.getPlanDetails.plan=="28 day plan")
                {
                    validity=28-dayDifference;
                }

                

               
            }

           
          
        
        }
            ).catch(err=>{
                throw err;});


                console.log(validity);

                

                if(validity>0)
                {
                    const keyboard= new Keyboard();
                    keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
                    ctx.reply(`Your plan is still active. Cannot subscribe to new plan! \n You still have ${validity} days remaining `,keyboard.draw());
                    return ctx.scene.leave();
                }

                else {

                    const plan=ctx.wizard.state.plan;
                    let amount;
                    const cuisine=ctx.wizard.state.cuisine;
                    const pack=ctx.wizard.state.pack;
                    let userId;
                    var count=0;

                    if (plan=="7 day plan")
                    {
                        
                        if(pack=="Regular")
                        {
                            amount=600
                        }
                        if(pack=="Medium")
                        {
                            amount=700
                        }
                        if(pack=="Jumbo")
                        {
                            amount=800
                        }
                    }

                     if (plan=="28 day plan")
                    {
                        
                        if(pack=="Regular")
                        {
                            amount=2399
                        }
                        if(pack=="Medium")
                        {
                            amount=2799
                        }
                        if(pack=="Jumbo")
                        {
                            amount=2999
                        }
                    }

                    if (delivery=="Pickup")
                    {
                        amount=amount+100;
                    }
            
                    const user = {
                        query:`
                        query
                        {
                          userexists(chatId: "${ctx.from.id}") {
                            _id
                          }
                        }
                        `
                    }
                
                
                    await fetch('https://metrono-backend.herokuapp.com/graphql',{
                        method:'POST',
                        body:JSON.stringify(user),
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
                        // console.log(response);
                        userId=response.data.userexists._id;
                        console.log(userId);
                    }).catch( err => 
                        {console.log(err)
                    throw err;}
                    )
                    
            
                    
            
                    var headers = { 'X-Api-Key': 'test_6bbdadf8c5089bf688f35b327b6', 'X-Auth-Token': 'test_b1526e3b6dd4a4863398f9b85ce'}
            
                    //payload holds information about transaction
                    var payload = {
                        // required fields
                            amount:`${amount}`,
                            purpose:'metrono',
                            
                    }
            
            
                    var promise =new Promise(function(resolve, reject){
            
                        request.post('https://test.instamojo.com/api/1.1/payment-requests/', { form: payload, headers: headers }, function (error, response, body) {
                            if (!error && response.statusCode == 201) {
                                const temp = JSON.parse(body);
                                // console.log("this"+temp.payment_request.id)
                                ctx.wizard.state.paymentId= temp.payment_request.id;
                                console.log(response.statusCode);
                                // ctx.reply(temp.payment_request.longurl)
                                const keyboard= new Keyboard();
                                keyboard.add("/start");
                                ctx.reply(`Your amount is${amount}`,keyboard.draw());
                                ctx.reply("Complete your payment", Markup.inlineKeyboard([
                                    Markup.urlButton('Make Payment', `${temp.payment_request.longurl}`)
                                ]).extra());
                                ctx
                                console.log(body);
                
                                
                
                                const Subscription= {
                                    query:`
                                    mutation{
                                        createSubscription(subscriptionInput:{
                                          plan:"${plan}",
                                          cuisine:"${cuisine}",
                                          pack:"${pack}",
                                          delivery:"${delivery}",
                                          subscribedUser:"${userId}",
                                          paymentId:"${temp.payment_request.id}",
                                          paymentStatus:"Pending",
                                          chatId:"${ctx.from.id}"
                                        })
                                        {
                                          chatId
                                        }
                                      }
                                    
                                    `
                                }
                
                                fetch('https://metrono-backend.herokuapp.com/graphql',{
                                                method:'POST',
                                                body:JSON.stringify(Subscription),
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
                                                console.log(response);
                                            }).catch( err => console.log(err))
                
                                            resolve(temp.payment_request.id); 
                                
                            }
                
                
                            
                
                            
                
                         })
                    });
            
                    await promise.then((res)=>{
                        var interval =setInterval(function testOne()
                    {
                        count=count+1;
            
                        request.get(`https://test.instamojo.com/api/1.1/payment-requests/${res}/`, {headers: headers}, function(error, response, body){
                            // console.log(response.statusCode);
                            if(!error && response.statusCode == 200){
                
                                // console.log(response.statusCode);
                                // console.log(body);
                                
                                const temp =JSON.parse(body);
            
                                
                                if(temp.payment_request.status=="Completed")
                                {
                                    if(temp.payment_request.payments[0].status=="Credit")
            
                                    {
            
                                        const updatePaymentStatus={
            
                                            query:
                                            `
                                            mutation{
                                                updateSubscriptionPaymentStatus(paymentId:"${res}")
                                                {
                                                  _id
                                                }
                                              }
            
            
                                            `
                                           
                                               
                                            }
                                        
            
                                        fetch('https://metrono-backend.herokuapp.com/graphql',{
                                            method:'POST',
                                            body:JSON.stringify(updatePaymentStatus),
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
                                            console.log(response);
                                        }).catch( err => console.log(err))
            
                                        const keyboard=new Keyboard();
                                        keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
                                        ctx.reply("Subscription Successful!",keyboard.draw());
                                        clearInterval(interval);
                                    }
                                    else
                                    {
            
                                        console.log("Recharge failed");
                                        clearInterval(interval);
            
                                    }
                                        
                                        
            
                                }
                                
                                console.log("pending")
                            }
                            })
                        
                        if (count>120)
                        {
                            request.post(`https://test.instamojo.com/api/1.1/payment-requests/${res}/disable/`, { form: payload, headers: headers }, function (error, response, body) {
                                console.log(response.statusCode);
                                if (!error && response.statusCode == 201) {
                                            console.log(response.statusCode);
                                            
            
                                }
                            }
                            )
            
                            ctx.reply("Session Expired try again");
                            clearInterval(interval);
                        }
                    },3000);
                    }).catch(err=>{
                        throw err;
                    });
            
            
            
            
            
            
                    return ctx.scene.leave();





                }

                // return ctx.scene.leave();

                






       

    }
)

exports.subscriptionScene=subscriptionScene;