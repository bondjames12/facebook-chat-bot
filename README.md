# Facebook Chat Bot
## Overview
This project uses the [Unofficial Facebook Chat API](https://github.com/Schmavery/facebook-chat-api) and the [Open AI API](https://platform.openai.com/docs/introduction) to run a ChatGPT style bot from a Facebook account.   

Read the documentation on the Unoffical Facebook Chat API to learn about how to customize bot functionality beyond the scope of this project.

## Features
-ChatGPT style bot that can be added to multiple groups with unique tracking

-DALL·E 2 style image generation in Facebook chat

## Installation
To get started, clone the repository and install the dependencies.

`git clone https://github.com/castey/facebook-chat-bot.git`

`cd facebook-chat-bot`

`npm install`

### Create a .env file in the root directory.

`FB_EMAIL=[your-facebook-email-address]`

`FB_PASSWORD=[your-facebook-password]`

`OPENAI_API_KEY=[your-openai-api-key]`

`BOT_NAME=[name]` - pick a name

`STAY_ON_FOR=5` - defines how many messages a bot will reply to in a single cycle

`COOLDOWN=10000`- defines the cooldown time for a bot sending replies during a cycle

## Usage
To start the bot, run:

`node main.js`

From within a Faceook chat window:

`-pic [prompt]` creates and replies with an AI generated image

`@[name]` tagging the bot account will trigger a cycle

## Dependencies

-dotenv

-openai

-axios

-fs

-facebook-chat-api

-puppeteer

## License
Idk I'm not a lawyer but like you can use it or whatever. Just give credit because that's nice, please 🥹.

## Contributing
Pull requests are welcome!
