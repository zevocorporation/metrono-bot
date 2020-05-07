const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");
const helper = require("./helper");


const menuScene = new WizardScene("MenuScene", async (ctx) => {
  user = await helper.verifyUser(ctx);

  if (!user) {
    ctx.reply(
      "Sorry you have to register first!",
      Markup.inlineKeyboard([
        Markup.callbackButton("Register", "REGISTER_NOW"),
      ]).extra()
    );
  } else {
    ctx.reply(
      "See the menu for ...",
      Markup.inlineKeyboard([
        [
          Markup.callbackButton("Today", "TODAY"),
          Markup.callbackButton("Tomorrow", "TOMORROW_MENU"),
        ],
        [
          Markup.urlButton(
            "Download Menu",
            "https://drive.google.com/file/d/1YMOpnNcStMSZX5HsbsL92pyCZc8yTMyH/view?usp=sharing"
          ),
        ],
      ]).extra()
    );
  }

  return ctx.scene.leave();
});

exports.menuScene = menuScene;

exports.displayTodayMenu = async function (ctx) {
  const date = new Date();
  const currenDay = date.toDateString().substring(0, 3);

  if (currenDay == "Mon") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with moong dhaal curry,seasonal vegetable & paapad\n\nDinner : \nPoori with potato mash\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with pachapayir sambar,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash"
    );
  }
  if (currenDay == "Tue") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with toor dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with sambar,seasonal vegetable & paapad\n\n_Dinner_ \nMasala dosa with chutney "
    );
  }
  if (currenDay == "Wed") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with rajma curry,seasonal vegetable & paapad\n\n_Dinner_ \nPhulka with panner butter masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nIdly with chutney and sambar\n\n_Lunch_ \nWhite rice with vathal kulambu,seasonal vegetable & paapad\n\n_Dinner_ \nIdly with sambar"
    );
  }
  if (currenDay == "Thu") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with khadi,seasonal vegetable & paapad\n\n_Dinner_ \nChole batura\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with more kolambu,seasonal vegetable & paapad\n\n_Dinner_ \nchole batura"
    );
  }
  if (currenDay == "Fri") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nAloo paratha with curd & pickle\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nCumin rice with gravy"
    );
  }
  if (currenDay == "Sat") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with channa dhaal,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with matar paneer\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with kadala curry,seasonal vegetable & paapad\n\n_Dinner_ \nPuttu with kadala curry"
    );
  }
  if (currenDay == "Sun") {
    await ctx.replyWithMarkdown(
      "T O D A Y' S M E N U \n\n*NORTH INDIAN*  \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala"
    );
  }
};

exports.displayTommorrowMenu = async function (ctx) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.toDateString().substring(0, 3);

  if (tomorrowDay == "Mon") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with moong dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDosa with chutney,vada & sambar\n\n_Lunch_ \nWhite rice with pachapayir sambar,seasonal vegetable & paapad\n\n_Dinner_ \nPoori with potato mash"
    );
  }
  if (tomorrowDay == "Tue") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with toor dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nPoori with potato mash\n\n_Lunch_ \nWhite rice with sambar,seasonal vegetable & paapad\n\n_Dinner_ \nMasala dosa with chutney "
    );
  }
  if (tomorrowDay == "Wed") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with rajma curry,seasonal vegetable & paapad\n\n_Dinner_ \nPhulka with panner butter masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nIdly with chutney,vada and sambar\n\n_Lunch_ \nWhite rice with vathal kulambu,seasonal vegetable & paapad\n\n_Dinner_ \nIdly with sambar"
    );
  }
  if (tomorrowDay == "Thu") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with khadi,seasonal vegetable & paapad\n\n_Dinner_ \nChole batura\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nAloo paratha with curd & pickle\n\n_Lunch_ \nWhite rice with more kolambu,seasonal vegetable & paapad\n\n_Dinner_ \nchole batura"
    );
  }
  if (tomorrowDay == "Fri") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal tadka,seasonal vegetable & paapad\n\n_Dinner_ \nAloo paratha with curd & pickle\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nMasala Dosa with chutney\n\n_Lunch_ \nWhite rice with mysore dhaal curry,seasonal vegetable & paapad\n\n_Dinner_ \nCumin rice with gravy"
    );
  }
  if (tomorrowDay == "Sat") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with channa dhaal,seasonal vegetable & paapad\n\n_Dinner_ \nPlain paratha with matar paneer\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nDhaalpoori\n\n_Lunch_ \nWhite rice with kadala curry,seasonal vegetable & paapad\n\n_Dinner_ \nPuttu with kadala curry"
    );
  }
  if (tomorrowDay == "Sun") {
    await ctx.replyWithMarkdown(
      "T O M O R R O W' S M E N U\n\n*NORTH INDIAN*  \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala\n---------------------------------------------------------\n*SOUTH INDIAN* \n\n_Breakfast_ \nSandwich with sauce sachet\n\n_Lunch_ \nWhite rice with dhaal makhani,seasonal vegetable & paapad\n\n_Dinner_ \nChapathi with chole masala"
    );
  }
};
