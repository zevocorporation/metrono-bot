const WizardScene=require('telegraf/scenes/wizard');
const fetch = require('node-fetch');
const Keyboard = require('telegraf-keyboard');
const request =require('request');
const Markup = require('telegraf/markup')


const subscriptionScene= new WizardScene(
    'SubscriptionScene',
    ctx=>
    {
        const keyboard=new Keyboard;
        keyboard.add("7 day plan -Rs.699").add("28 day plan-Rs.3000").add("Home");
        ctx.reply("Choose from plans given below",keyboard.draw());
        return ctx.wizard.next();
    },

    ctx=>{
        if(ctx.message.text!="7 day plan -Rs.699" && ctx.message.text!="28 day plan-Rs.3000"  && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add("Home");
            ctx.reply("Please Choose from given plans!",keyboard.draw());
            return ctx.wizard.next();
            
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }
        if(ctx.message.text=="7 day plan -Rs.699")
        {
            ctx.wizard.state.plan="7 day plan";
            ctx.wizard.state.amount=699;

        }
        else if(ctx.message.text=="28 day plan-Rs.3000")
        {
            ctx.wizard.state.plan="28 day plan";
            ctx.wizard.state.amount=3000;
        }

        const keyboard=new Keyboard;
        keyboard.add("North Indian").add("South Indian").add("Home");
        ctx.reply("Select a cuisine!",keyboard.draw());
        return ctx.wizard.next();
        




    },

    async ctx=>{

        if(ctx.message.text!="North Indian" && ctx.message.text!="South Indian"  && ctx.message.text!="Home" )
        {
            const keyboard=new Keyboard;
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
             ctx.reply("Please Choose from given plans!",keyboard.draw());
            return ctx.scene.leave();
            
        }

        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
            ctx.reply("Choose an option!",keyboard.draw());

            return ctx.scene.leave();
        }


        let validity;
        let noPlanYet=false;

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

        await fetch('http://localhost:4000/graphql',{
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

            else{

                noPlanYet=true;

            }

          
        
        }
            ).catch(err=>{
                throw err;});


                console.log(validity);

                

                if(validity>0)
                {
                    const keyboard= new Keyboard();
                    keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
                    ctx.reply(`Your plan is still active. Cannot subscribe to new plan! \n You still have ${validity} days remaining `,keyboard.draw());
                    return ctx.scene.leave();
                }

                else {

                    const plan=ctx.wizard.state.plan;
                    const amount=ctx.wizard.state.amount;
                    const cuisine=ctx.message.text;
                    let userId;
                    var count=0;
            
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
                
                
                    await fetch('http://localhost:4000/graphql',{
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
                                ctx.reply(`Your amount is${amount}`, Markup.inlineKeyboard([
                                    Markup.urlButton('Make Payment', `${temp.payment_request.longurl}`)
                                ]).extra());
                                console.log(body);
                
                                
                
                                const Subscription= {
                                    query:`
                                    mutation{
                                        createSubscription(subscriptionInput:{
                                          plan:"${plan}",
                                          cuisine:"${cuisine}",
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
                
                                fetch('http://localhost:4000/graphql',{
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
                                        
            
                                        fetch('http://localhost:4000/graphql',{
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
                                        keyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account');
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