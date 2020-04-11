const WizardScene=require('telegraf/scenes/wizard');
const Keyboard = require('telegraf-keyboard');
const fetch = require('node-fetch');
const request =require('request');
const Markup = require('telegraf/markup');
const uuid=require('uuid');




const walletScene= new WizardScene(
    'WalletScene',
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



















        
        const keyboard=new Keyboard();
        keyboard.add('Check balance','Recharge wallet').add("Home");
        ctx.reply("Check your balance or recharge your wallet",keyboard.draw());
        return ctx.wizard.next();

    },


   async ctx=>{

        

        if(ctx.message.text!="Check balance" && ctx.message.text!="Recharge wallet" && ctx.message.text!="Home")
        {
            const keyboard=new Keyboard();
            keyboard.add("Home");
            ctx.reply("Please Choose from given options!",keyboard.draw())
            return ctx.wizard.next();
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

        if(ctx.message.text=="Check balance")
        {
            
            const getCredits = {
                query: `

                    query
                    {
                    getCredits(chatId:"${ctx.from.id}")
                    
                    }
                
                
                `
            }

            await fetch('https://metrono-backend.herokuapp.com/graphql',{
            method:'POST',
            body:JSON.stringify(getCredits),
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
            const keyboard=new Keyboard();
            keyboard.add("Home");
            ctx.reply("Your credit balance is "+ response.data.getCredits,keyboard.draw())
            return ctx.wizard.next(); ;
        }).catch( 
            err => {
                console.log(err)
                ctx.reply("Something went Wrong! :(")
                throw err;
            } )

        }
        
        if(ctx.message.text=="Recharge wallet")
        {
            const keyboard =new Keyboard();
            keyboard.add("Silver Pack Rs.99 200credits").add("Gold Rs.299 1000credits").add("Zero Rs.499 2500credits").add("Home");
            ctx.reply("Choose from Recharge options",keyboard.draw());
            return ctx.wizard.next();

        }

        
        
        
    },

    async ctx=>{
        let amount;
        let credit;
        let userId;
        let count=0;
        

    if(ctx.message.text!="Silver Pack Rs.99 200credits" && ctx.message.text!="Gold Rs.299 1000credits" && ctx.message.text!="Zero Rs.499 2500credits" && ctx.message.text!="Home")
    {
            const keyboard=new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Please Choose from given options!",keyboard.draw())
            return ctx.scene.leave();
    }

    if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }

    const plan=ctx.message.text;
    
    if(plan=="Silver Pack Rs.99 200credits")
    {
        amount=99;
        credit=200;
    }
    else if(plan=="Gold Rs.299 1000credits")
    {
        amount=299;
        credit=1000;
    }
    else if(plan=="Zero Rs.499 2500credits")
    {
        amount=499;
        credit=2500;
    }

    const getCredits = {
        query: `

            query
            {
            getCredits(chatId:"${ctx.from.id}")
            
            }
        
        
        `
    }

    await fetch('https://metrono-backend.herokuapp.com/graphql',{
    method:'POST',
            body:JSON.stringify(getCredits),
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
            credit=credit+response.data.getCredits
        }).catch( 
            err => {
                console.log(err)
                ctx.reply("Something went Wrong! :(")
                throw err;
            } )

    

   

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
                ctx.reply(`Your amount is Rs.${amount}`,keyboard.draw())
                ctx.reply(`Click below to Pay`, Markup.inlineKeyboard([
                    Markup.urlButton('Make Payment', `${temp.payment_request.longurl}`)
                ]).extra());
                console.log(body);

                

                const wallet= {
                    query:`
                    mutation{
                        walletRecharge(walletInput:{plan:"${plan}",purchasedUser:"${userId}",paymentId:"${temp.payment_request.id}",paymentStatus:"Pending"})
                          {
                            plan
                          }
                        }
                    `
                }

                fetch('https://metrono-backend.herokuapp.com/graphql',{
                                method:'POST',
                                body:JSON.stringify(wallet),
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

    await promise.then(res=>{
        var interval =setInterval( function testOne()
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

                            const setCredits={

                                query:
                                `
                                mutation{
                                    setCredits(chatId:"${ctx.from.id}",credit:${credit})
                                    {
                                      _id
                                    }
                                  }


                                `
                               
                                   
                                }


                                const updateWalletPaymentStatus={
                                    query:`
                                    mutation{
                                        updateWalletPaymentStatus(paymentId:"${res}")
                                        {
                                          plan
                                        }
                                      }
                                    
                                    
                                    `
                                }
                                
                                 fetch('https://metrono-backend.herokuapp.com/graphql',{
                                method:'POST',
                                body:JSON.stringify(updateWalletPaymentStatus),
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

                            fetch('https://metrono-backend.herokuapp.com/graphql',{
                                method:'POST',
                                body:JSON.stringify(setCredits),
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
                            ctx.reply("Recharge Successful!",keyboard.draw());
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
                });
                // ctx.reply("Session Expired try again");
                clearInterval(interval);
            }
        },3000);
    }).catch(err=>{throw err;})

   

    return ctx.scene.leave();



    });

exports.walletScene=walletScene;