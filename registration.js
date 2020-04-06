
const WizardScene=require('telegraf/scenes/wizard');// Middleware to create a scene 

const fetch = require('node-fetch');

const Keyboard = require('telegraf-keyboard');




//create a scene object
//First parameter is the sceneId
//Other parameters are anonymous functions that are executed consecutively/

const  registerScene= new WizardScene(
    
    "Register",

    ctx=> {
        ctx.reply("Please edo the honour of entering your name.");
        
        // To go to next function
        return ctx.wizard.next();
    },

    ctx=>{


        //A state object to pass data across functions. Somewhat like sessions
        ctx.wizard.state.yourName=ctx.message.text;

        ctx.reply("Enter your number");
        return ctx.wizard.next();
    },

    ctx=>{
        
        const mobile=ctx.message.text;
        // Validation
        if (mobile.length!=10)
        {
            ctx.reply("Please enter a valid number");
            
            return;
        }
        for(i=0;i<10;i++)
        {
            if((mobile[i]>='a' && mobile[i]<='z')||(mobile[i]>='A' && mobile[i]<='Z'))
            {
                ctx.reply("Please enter a valid number");
            
            return;
            }
        }

       
        ctx.wizard.state.yourMobile=ctx.message.text;
        ctx.reply("State your Email Id please");
        return ctx.wizard.next();

    },

    ctx=>{

        const email=ctx.message.text

        if(!email.includes('@'))
        {
            ctx.reply("Please enter a valid Email");
            
            return;

        }
        if(!email.includes('.'))
        {
            ctx.reply("Please enter a valid Email");
            
            return;

        }
        
        ctx.wizard.state.yourEmail=ctx.message.text
        ctx.reply("Final request to enter your address");
        return ctx.wizard.next();
    },
   async ctx=>{
        //Retrieve data from state

        let userexist=false;
        const address=ctx.message.text
        const name=ctx.wizard.state.yourName;
        const mobile=ctx.wizard.state.yourMobile;
        const email=ctx.wizard.state.yourEmail;
        const chatId=ctx.from.id


        //Build query
        const requestBody ={
            query:`
            mutation
                {
                createUser(userInput:{
                    name:"${name}",
                    mobile:"${mobile}",
                    email:"${email}",
                    address:"${address}",
                    chatId:"${chatId}"
                })
                    {
                    
                    name
                    mobile
                    email
                    address
                    
                    }
                }
            `
        }


        
   
        //Use fetch api to communicate with mongo DB
        //Fetch method returns a promise
       await fetch('https://metrono-backend.herokuapp.com/graphql',{
            method:'POST',
            body:JSON.stringify(requestBody),
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
            // ctx.reply('You are registered successfully!');
            if(response.data.createUser)
            {
                ctx.reply('You are registered successfully!');
            }
            else
            {
                ctx.reply('Already registered!');
            }
            
        }).catch( 
            err => {
                console.log(err)
                ctx.reply("Something went Wrong! :(")
                throw err;
            } )



        //If everything goes well
        

        //Create keyboard object 
        const keyboard = new Keyboard();

        // use add method to add buttons to keyboard
        keyboard.add('/start');

        //use draw method to display the keyboard
        ctx.reply('Click below to go home',keyboard.draw());

        //Exit the scene
        return ctx.scene.leave();

    }
);




exports.registerScene=registerScene;







