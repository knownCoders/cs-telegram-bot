process.env.NTBA_FIX_319 = 1
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const path = require('path');
const { localDB } = require('./subjects');
const bodyParser = require('body-parser');


const express = require('express');

const app = express();
app.use(bodyParser.json());




app.get("/",(req,res)=>{
  res.status(200).sendFile(path.join(__dirname, '/index.html'))
})

const port = process.env.PORT || 3000

const botToken = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(botToken,{
  // webHook:true,
  polling:false
});

app.listen(port, () => {
bot.setWebHook(process.env.SERVER_URL+"/webhook",)
.then((res)=>{
  console.log(res,"dllllllllllllllllllllllllllllllllll");
}).catch((Ee)=>{
  console.log(Ee,"EeEeEeEeEeEeEeEeEeEeEeEeEeEe");

})
  console.log('Server is running ' + port);
});






app.post('/webhook', (req, res) => {


    const data = req.body; // البيانات التي تم إرسالها من الويب هوك
    bot.processUpdate(data)
    res.sendStatus(200);
    
});

bot.on("polling_error", ()=>{});
const current = {
  level:0,
  term:0,
  subj:{
    type: "",
    isWorkable:false,
    folder:"",
  },
};

bot.on('message', (msg) => {

  
  const chatId = msg?.chat?.id , mesgId = msg?.message_id , text = msg?.text;
  if (text == 'من عمك') {
    bot.sendMessage(chatId,"علي باوزير ")
    return
  }
  if (text == "السلام عليكم") {
    bot.sendMessage(chatId,"وعليكم السلام")
    return
  }
  if (text == "قايمه" || text == "قائمه" || text == "قائمة" ||text == "قايمة" || text == "/start"  ) {
    bot.sendMessage(chatId,"      👨‍🎓      حدد المستوى الدراسي     👨‍🎓     ",
    {
      reply_markup:{
        inline_keyboard:[
          [{text:"مستوى اول", callback_data:JSON.stringify({type:"level",data:1,})}],
          [{text:"مستوى ثاني",callback_data:JSON.stringify({type:"level",data:2,})}],
          [{text:"مستوى ثالث",callback_data:JSON.stringify({type:"level",data:3,})}],
          // [{text:"مستوى رابع",callback_data:JSON.stringify({type:"level",data:4,})}],
        ]
      }
    });
    return
  }

  bot.sendMessage(chatId,"يكفي لعب 😒 ")

});


function getFileType(filePath) {
  const ext = path.extname(filePath).slice(1);
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
    case 'xls':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

const sendbooks = async  (type = 0 || 1,chatId,data,mesgId) => { 
    const folderPath = __dirname + "/computer scince/level_"+ data?.lv + "/term_" + data?.trm + "/" + data.fol + "/" + type;
    if (fs.existsSync(folderPath)) {
        fs.readdir( folderPath,  (err, files) => {
        if (err) {
          console.error('حدث خطأ في قراءة محتوى المجلد:', err);
          bot.sendMessage(chatId,"🫢 ops !!");
          setTimeout(() => {
            replayListAfterSend(chatId)
          }, 1000);
          return;
        }
        if (files.length == 0) {
            
          bot.sendMessage(chatId,"غير موجوده حاليا");
        } else {
          files.forEach( async (file,x,a) => {
            const filePath = path.join(folderPath, file);
            const res = await bot.sendDocument(chatId,filePath,{},{contentType:getFileType(file)})
            if (a?.length-1 == x) {
              setTimeout(() => {
                replayListAfterSend(chatId)
              }, 1000);
            }
          });
        }
      });
      
   } else {
    bot.sendMessage(chatId,"🫢 ops !!");
    setTimeout(() => {
      replayListAfterSend(chatId)
    }, 1000);
   }

 }

const sendChannels = async (type = 0 || 1,chatId,data,mesgId) => { 
  const folderPath = __dirname + "/computer scince/level_"+ data?.lv + "/term_" + data?.trm + "/" + data.fol + "/youtube.json";
  if (fs.existsSync(folderPath)) {
    const red = JSON.parse(fs.readFileSync(folderPath));
    if (red && red?.length != 0) {
      red.map( async (ele,x,a)=>{
        await bot.sendMessage(chatId,`${ele?.desc}

         إسم القناة : ${ele?.channelName} .
         الرابط : [إضغط هنا](${ele?.link}).
        `,{
          parse_mode:"Markdown"
        })
        if (a?.length-1 == x) {
          setTimeout(() => {
            replayListAfterSend(chatId)
          }, 1000);
        }
      })

    }else{
      bot.sendMessage(chatId,"لاتوجد روابط حاليا");
      setTimeout(() => {
        replayListAfterSend(chatId)
      }, 1000);
    }
  } else {
    bot.sendMessage(chatId,"لاتوجد روابط حاليا");
    setTimeout(() => {
      replayListAfterSend(chatId)
    }, 1000);
  }
 


}

const backHandler = (chatId,To,mesgId,backAfterSendBooksOrChannels) => {
 
  switch (To) {
    case "home":
      bot.editMessageText(" 👨‍🎓      حدد المستوى الدراسي     👨‍🎓 ",
      {
        chat_id:chatId,
        message_id:mesgId,
        reply_markup:{
          inline_keyboard:[
            [{text:"مستوى اول", callback_data:JSON.stringify({type:"level",data:1,})}],
            [{text:"مستوى ثاني",callback_data:JSON.stringify({type:"level",data:2,})}],
            // [{text:"مستوى ثالث",callback_data:JSON.stringify({type:"level",data:3,})}],
            // [{text:"مستوى رابع",callback_data:JSON.stringify({type:"level",data:4,})}],
          ]
        }
      });
      break;

    case "term":
      bot.editMessageText("👇      حدد الترم       👇",
      {
        chat_id:chatId,
        message_id:mesgId,
        reply_markup:{
          inline_keyboard:[
            [{text:"الترم الأول",callback_data:JSON.stringify({type:"term",data:{term:1,level:current.level},})}],
            [{text:"الترم الثاني",callback_data:JSON.stringify({type:"term",data:{term:2,level:current.level},})}],
            [
              {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
              {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
            ]
          ]
        }
      });
      break;
    case "subj":
      let subjects = localDB["level" + current?.level ]["term" + (current?.term)];
      bot.editMessageText("📖    حدد المادة    📖" ,
      {
        chat_id:chatId,
        message_id:mesgId,
        reply_markup:{
          inline_keyboard:[
            ...subjects,
            [
              {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"term"}})},
              {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
            ]
          ],
        }
      });
      break;

    // case "0":

    //   break;
    default:
      break;
  }
}

const replayListAfterSend = (chatId) => { 
        
  let subjects = [...localDB["level" + current.level ]["term" + (current.term)]];
  
  const nameOfSubject = subjects.find(e=>e[0]?.callback_data.includes(current?.subj?.folder))
 
  bot.sendMessage(chatId,`/    ${nameOfSubject[0]?.text}    \\`,
    {
     
      reply_markup:{
        inline_keyboard : [
        [{text:"الملازم 📚",callback_data:JSON.stringify({type:"books",lv:current.level,trm:current.term,fol:current.subj.folder})}],
        [{text:"نماذج إختبارات 📃",callback_data:JSON.stringify({type:"exams",lv:current.level,trm:current.term,fol:current.subj.folder})}],
        [{text:" قنوات يوتيوب ▶️",callback_data:JSON.stringify({type:"youtubechannels",lv:current.level,trm:current.term,fol:current.subj.folder})}],
        [
          {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"subj"}})},
          {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
        ]
      ],
      }
    });
 }

bot.on("callback_query",(Q)=>{
  const query = JSON.parse(Q.data) , mesgId = Q.message.message_id;
  const chatId = Q.message.chat.id;

  switch (query.type) {
      case "level":{
        // ## Current Level ##
        if (query.data > 0) {
          current.level = query.data;
          bot.editMessageText("👇      حدد الترم       👇",
          {
            chat_id:chatId,
            message_id:mesgId,
            reply_markup:{
              inline_keyboard:[
                [{text:"الترم الأول",callback_data:JSON.stringify({type:"term",data:{term:1,level:query.data},})}],
                [{text:"الترم الثاني",callback_data:JSON.stringify({type:"term",data:{term:2,level:query.data},})}],
                [
                  {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
                  {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
                ]
              ]
            }
          });
        }
        break;
      }
      // ############
      // ############ 1
      // ############
      case "term":{
        // ## Current Term ##
        current.term = query.data.term;
        let subjects = localDB["level" + query?.data?.level ]["term" + (query?.data?.term)];

        if (query.data.term > 0) {

          bot.editMessageText("📖      حدد المادة      📖" ,
          {
            chat_id:chatId,
            message_id:mesgId,
            reply_markup:{
              inline_keyboard:[
                ...subjects, 
               [
                {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"term"}})},
                {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
              ]
            ],
            }
          });
        } else {
          // console.log(query.data.term,"//////////////////////////");
        }
        break;
      }
      // ############
      // ############ 2
      // ############
      case "subj":{
        // ## Current subject ##
        current.subj = query.data;
        
        let subjects = [...localDB["level" + current.level ]["term" + (current.term)]];
        

        
        const nameOfSubject = subjects.find(e=>e[0]?.callback_data.includes(query?.data?.folder))
       
        
        if (query.data?.isWorkable) {

          bot.editMessageText(`/      ${nameOfSubject[0]?.text}         \\`,
        {
          chat_id:chatId,
          message_id:mesgId,
          reply_markup:{
            inline_keyboard : [
            [{text:"ملازم النظري 📚",callback_data:JSON.stringify({type:"books",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [{text:"ملازم العملي 📚",callback_data:JSON.stringify({type:"WorkableBooks",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [{text:"نماذج إختبارات 📃",callback_data:JSON.stringify({type:"exams",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [{text:" قنوات يوتيوب ▶️",callback_data:JSON.stringify({type:"youtubechannels",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [
              {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"subj"}})},
              {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
            ]
          ],
          }
        });
        } else {
          bot.editMessageText(`/    ${nameOfSubject[0]?.text}    \\`,
        {
          chat_id:chatId,
          message_id:mesgId,
          reply_markup:{
            inline_keyboard : [
            [{text:"الملازم 📚",callback_data:JSON.stringify({type:"books",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [{text:"نماذج إختبارات 📃",callback_data:JSON.stringify({type:"exams",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [{text:" قنوات يوتيوب ▶️",callback_data:JSON.stringify({type:"youtubechannels",lv:current.level,trm:current.term,fol:query.data.folder})}],
            [
              {text:"عودة 🔙",callback_data:JSON.stringify({type:"back",data:{backTo:"subj"}})},
              {text:"القائمة الرئيسية 🔝",callback_data:JSON.stringify({type:"back",data:{backTo:"home"}})},
            ]
          ],
          }
        });
        }
        break;
      }
      case "WorkableBooks":{
        //  يعني0 الملازم النظري و 1 للملازم العملي
        sendbooks(1,chatId,query,mesgId)
        break;
      }
      case "exams":{
        //  يعني0 الملازم النظري و 1 للملازم العملي
        sendbooks("exams",chatId,query,mesgId)

        break;
      }
      case "books":{
        //  يعني0 الملازم النظري و 1 للملازم العملي
        sendbooks(0,chatId,query,mesgId)
        break;
      }
      case "youtubechannels":{
        sendChannels(0,chatId,query,mesgId)
        break;
      }
      case "back":{
        backHandler(chatId,query?.data?.backTo,mesgId)
      }

    default:
      break;
  } 



})

bot.startPolling()

