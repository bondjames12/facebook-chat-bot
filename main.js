const fs = require('fs');
const login = require('facebook-chat-api');
const getModifiedCookie = require('./src/login');
const readline = require('readline');

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

const startLogin = async () => {
  const modifiedFbCookies = await getModifiedCookie();
  const handleMessage = require('./messageHandler');
  login(credential = { appState: modifiedFbCookies }, (err, api) => {
    if (err) return console.error(err);

    api.listenMqtt((err, message) => {
      if (err) console.error("Listening Error!");
      if (message.type) {
        handleMessage(api, message);
      } else {
        console.error("Type error!\n" + message);
      }
    });
  });
};

loadEnv();
