const fs = require('fs');
const login = require('facebook-chat-api');
const getModifiedCookie = require('./src/login');
const readline = require('readline');

// check if .env file exists and if not copy from the .env.example file and prompt for email/password/API key
function loadEnv(){
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
  }

  require('dotenv').config();

  const missingEnvVars = [];
  if (!process.env.FB_EMAIL) missingEnvVars.push('FB_EMAIL');
  if (!process.env.FB_PASSWORD) missingEnvVars.push('FB_PASSWORD');
  if (!process.env.OPENAI_API_KEY) missingEnvVars.push('OPENAI_API_KEY');

  if (missingEnvVars.length > 0) {
    promptForEnvVars(missingEnvVars);
  } else {
    startLogin();
  }
};

// function to prompt user for missing env variables in console
function promptForEnvVars(missingVars){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function promptNextVar(index = 0){
    if (index >= missingVars.length) {
      rl.close();
      startLogin();
      return;
    }
    const envVar = missingVars[index];
    rl.question(`Enter ${envVar}: `, (value) => {
      process.env[envVar] = value;
      fs.appendFileSync('.env', `\n${envVar}=${value}`);
      promptNextVar(index + 1);
    });
  }

  promptNextVar();
};

// begin logging in
async function startLogin(){

  const handleMessage = require('./messageHandler'); // this needs to be here or else the loadEnv function breaks 

  // use headless browser function to get formatted login cookie from facebook
  //const modifiedFbCookies = await getModifiedCookie();
  const modifiedFbCookies = [
    {
      "key": "sb",
      "value": "L4RLZVt_NBuDsE1GLH3iO6kn",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1734008679.024034,
      "httpOnly": true,
      "secure": true
    },
    {
      "key": "datr",
      "value": "L4RLZT3jsgFTPqhlC6H_8XSq",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1734007870.029872,
      "httpOnly": true,
      "secure": true
    },
    {
      "key": "locale",
      "value": "en_US",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1700052670.029917,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "c_user",
      "value": "100081727035164",
      "domain": ".facebook.com",
      "path": "/",
      "expires": -1,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "xs",
      "value": "24%3AQlFxw-urrsHVBg%3A2%3A1699448677%3A-1%3A15070",
      "domain": ".facebook.com",
      "path": "/",
      "expires": -1,
      "httpOnly": true,
      "secure": true
    },
    {
      "key": "wd",
      "value": "1438x863",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1700054589,
      "httpOnly": false,
      "secure": true,
      "sameSite": "Lax"
    },
    {
      "key": "cppo",
      "value": "1",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1699535189,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "usida",
      "value": "eyJ2ZXIiOjEsImlkIjoiQXMzdDMyODVvdHRudyIsInRpbWUiOjE2OTk0NDg3ODh9",
      "domain": ".facebook.com",
      "path": "/",
      "expires": -1,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "presence",
      "value": "C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1699449139681%2C%22v%22%3A1%7D",
      "domain": ".facebook.com",
      "path": "/",
      "expires": -1,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "dpr",
      "value": "1.5",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1700054586,
      "httpOnly": false,
      "secure": true
    },
    {
      "key": "fr",
      "value": "0UHJJWylMT8kBzKn4.AWXag-Lve2Ig4zoANS_z0ylPl5A.BlS4Qv.xX.AAA.0.0.BlS4u9.AWWQR9sDLhU",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1707225788.17213,
      "httpOnly": true,
      "secure": true
    }
  ]
  
  // login to account using login cookie and facebook chat api
  login(credential = { appState: modifiedFbCookies }, (err, api) => {
    if (err) return console.error(err);

    // begin listening for messages
    api.listenMqtt((err, message) => {
      if (err) console.error("Listening Error!");

      if (message && message.type) {
        switch (message.type) {
          case "message":
          case "message_reply":

            handleMessage(api, message);
            break;

          default:
          //console.log(`Alternate message type: ${message.type} in thread ID: ${message.threadID}`);
        }
      } else if (message && !message.type) { // some light error handling
        console.error("Type error!\n" + message);
      }
      else {
        console.error("Unknown error!");
      }
    });
  });
};

loadEnv();
