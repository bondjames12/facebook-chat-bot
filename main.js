const fs = require('fs');
const login = require('facebook-chat-api');
const getModifiedCookie = require('./src/login');
const readline = require('readline');
const handleMessage = require('./messageHandler');

// check if .env file exists and if not copy from the .env.example file and prompt for email/password/API key
const loadEnv = () => {
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
const promptForEnvVars = (missingVars) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const promptNextVar = (index = 0) => {
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
const startLogin = async () => {

  // use headless browser function to get formatted login cookie from facebook
  const modifiedFbCookies = await getModifiedCookie();

  // login to account using login cookie and facebook chat api
  login(credential = { appState: modifiedFbCookies }, (err, api) => {
    if (err) return console.error(err);

    // begin listening for messages
    api.listenMqtt((err, message) => {
      if (err) console.error("Listening Error!");

      if (message && message.type) {
        handleMessage(api, message);
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
