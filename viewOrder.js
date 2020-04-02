const WizardScene=require('telegraf/scenes/wizard');
const Keyboard = require('telegraf-keyboard');
const fetch = require('node-fetch');
const Markup = require('telegraf/markup');
const startkeyboard= new Keyboard();
startkeyboard.add('Wallet','Menu').add('Subscribe Plans','Order Meals','Order Addons').add('My Plans','My Account','My Orders');


const viewOrderScene=new WizardScene(

    'ViewOrderScene',
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
        




        const keyboard = new Keyboard();
        keyboard.add("Track your order").add("Order History").add("Home");
        ctx.reply("Track your order or View Order History",keyboard.draw());

        return ctx.wizard.next();

        

    },
    async ctx=>{
        if (ctx.message.text!="Track your order" && ctx.message.text!="Order History" && ctx.message.text!="Home" )
        {
            const keyboard = new Keyboard();
            ctx.reply("Choose an option!",startkeyboard.draw());
            return ctx.scene.leave();
        }


        if(ctx.message.text=="Home")
        {
            const keyboard = new Keyboard();
            ctx.reply("Choose an option!",startkeyboard.draw());

            return ctx.scene.leave();
        }

        const getOrders={
            query:`
            
            query{
                getCurrentOrders(chatId:"${ctx.from.id}")
                  {
                    cuisine
                    orderType
                    orderFor
                    orderStatus
                    createdAt
                    updatedAt
                    size
                    addon
                    
                  }
                  
                }
            
            
            `
        }


        if(ctx.message.text=="Track your order")
        {
           

            await fetch('https://metrono-backend.herokuapp.com/graphql',{
                method:'POST',
                body:JSON.stringify(getOrders),
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
                let count=0;

                for(i=0;i<response.data.getCurrentOrders.length;i++)
                {
                    
                    // console.log(response.data.getCurrentOrders[i].orderStatus);
                    if(response.data.getCurrentOrders[i].orderStatus!="Delivered")
                    {
                        count=count+1;
                    }

                }

                console.log(count);



                if (count>0)
                {
                    for (i=0;i<response.data.getCurrentOrders.length;i++)
                {
                    
                    // console.log(response.data.getCurrentOrders[i])

                    if(response.data.getCurrentOrders[i].orderStatus!="Delivered")
                    {
                        if(response.data.getCurrentOrders[i].addon=="Not applicable")
                        {
                            ctx.reply("You order of "+response.data.getCurrentOrders[i].cuisine+ " "+response.data.getCurrentOrders[i].orderType+" for " + response.data.getCurrentOrders[i].orderFor+" of pack size "+ response.data.getCurrentOrders[i].size +" ordered at "+ response.data.getCurrentOrders[i].createdAt+ " is " + response.data.getCurrentOrders[i].orderStatus)

                        }
                        else
                        {
                            ctx.reply("You order of add-on "+response.data.getCurrentOrders[i].addon+ " for "+response.data.getCurrentOrders[i].orderType+" "+ response.data.getCurrentOrders[i].orderFor+" of quantity "+ response.data.getCurrentOrders[i].size +" ordered at "+ response.data.getCurrentOrders[i].createdAt+ " is " + response.data.getCurrentOrders[i].orderStatus)

                        }
                        
                    }

                    
                }
                }

                else
                {
                    ctx.reply("You have no current any orders!")
                }
                
                
            }).catch( 
                err => {
                    console.log(err)
                    ctx.reply("Something went Wrong! :(")
                    throw err;
                } )


                ctx.reply("Choose an option",startkeyboard.draw())


                return ctx.scene.leave();
    





        }


        if(ctx.message.text=="Order History")
        {
            await fetch('https://metrono-backend.herokuapp.com/graphql',{
                method:'POST',
                body:JSON.stringify(getOrders),
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
            }).then( response=> {
                // console.log(response);
                let count=0;
                for(i=0;i<response.data.getCurrentOrders.length;i++)
                {
                    if(response.data.getCurrentOrders[i].orderStatus=="Delivered")
                    {
                        count=count+1;
                    }

                }

                console.log(count);

                
                if(count>0)
                {

                    for (i=0;i<response.data.getCurrentOrders.length;i++)
                    {
                        
                        // console.log(response.data.getCurrentOrders[i])
    
                        if(response.data.getCurrentOrders[i].orderStatus=="Delivered")
                        {
                            
                            if(response.data.getCurrentOrders[i].addon=="Not applicable")
                            {
                                ctx.reply("You order of "+response.data.getCurrentOrders[i].cuisine+ " "+response.data.getCurrentOrders[i].orderType+" for " + response.data.getCurrentOrders[i].orderFor+" of pack size "+ response.data.getCurrentOrders[i].size +" ordered at "+ response.data.getCurrentOrders[i].createdAt+ " was delivered on " + response.data.getCurrentOrders[i].updatedAt)
    
                            }
                            else
                            {
                                ctx.reply("You order of add-on "+response.data.getCurrentOrders[i].addon+ " for "+response.data.getCurrentOrders[i].orderType+" "+ response.data.getCurrentOrders[i].orderFor+" of quantity "+ response.data.getCurrentOrders[i].size +" ordered at "+ response.data.getCurrentOrders[i].createdAt+ " was delivered on " + response.data.getCurrentOrders[i].updatedAt)
    
                            }
                            
                        }
    
                        
                    }

                }
                else{
                     ctx.reply("Your order history is empty!");
                }


               
                
            }).catch( 
                err => {
                    console.log(err)
                    ctx.reply("Something went Wrong! :(")
                    throw err;
                } )


                ctx.reply("Choose an option!",startkeyboard.draw())


                return ctx.scene.leave();
    
        }
    }
);

exports.viewOrderScene=viewOrderScene;