# Facebook Chat Bot
## Overview
This Node.js project uses the [Unofficial Facebook Chat API](https://github.com/Schmavery/facebook-chat-api) and the [OpenAI API](https://platform.openai.com/docs/introduction) to run a ChatGPT style bot with AI image generation from a Facebook account. Also includes as few fun features.

Read the documentation on the Unoffical Facebook Chat API to learn how to customize bot functionality beyond the scope of this project.

## Features
-ChatGPT style bot that can be added to multiple groups with unique tracking

-DALL·E 2 style image generation

-Simple calculator 

-Cat balloon calculator [(read more)](https://chat.openai.com/share/3bce0d7c-9715-4a0e-8ce5-5ba70426292f)

-Leekspin

## Installation
To get started, clone the repository and install the dependencies.

`git clone https://github.com/castey/facebook-chat-bot.git` or [download the ZIP](https://github.com/castey/facebook-chat-bot/archive/refs/heads/main.zip)

`cd /YOUR_SYSTEM_PATH/facebook-chat-bot` navigate to the project directory 

`npm install` install dependencies 

## Usage

You will need to have [Node.js®](https://nodejs.org/en) installed.

To start the bot, run:

`node main.js`

It will prompt you for an email, password, and OpenAI API key

To obtain an API key visit [OpenAI](https://platform.openai.com/)

# Bot Commands

Here are the available commands for the bot:

| Command                 | Description                                               |
|-------------------------|-----------------------------------------------------------|
| `-pic [prompt]`         | Creates and replies with an AI generated image. You can also use natural language prompts like "send me a picture of a tree" in a wake cycle. |
| `@[name]`               | Tagging the bot account will trigger a wake cycle.        |
| `-math [expression]`    | Calculates the result of the given math expression.       |
| `-cat [number]`         | Calculates how high a cat will go if N number of balloons were tied to it. |
| `leekspin [start/stop]` | Sends the leekspin gif. Unique timers for each sender in each thread. |

# .env Settings

Settings you can configure from within your .env file [(see example)](https://github.com/castey/facebook-chat-bot/blob/main/.env.example)

| Command                 | Description                                               |
|-------------------------|-----------------------------------------------------------|
| `FB_EMAIL`              | Email address for facebook account. |
| `FB_PASSWORD`           | Password for facebook account.      |
| `BOT_NAME`              | Choose a custom name for the AI to go by - optional but might improve performance slightly if you give it the same name as the account you're running the bot from. |
| `STAY_ON_FOR`           | Number of messages the AI will reply to during a wake cycle. |
| `COOLDOWN`              | Amount of time the AI waits between choosing to respond to messages during a wake cycle. |
| `HISTORY_LENGTH`        | Length of past messages to give the AI as context. |
| `SAVE_AI_PICS`          | boolean: `true/false` saves AI generated pictures to a subdirectory. |

## Dependencies

-dotenv

-openai

-axios

-fs

-facebook-chat-api

-puppeteer

-readline

-sharp

## Screenshots

![Example Image](AIpics/pic.png)
![Example Image](AIpics/bot.png)

## Side Notes

Using the image generation feature `-pic` saves the generated image to the AIpics subdirectory. 

Running `npm install` will show some vulnerabilities. This is because the dependencies used by the [Unofficial Facebook Chat API](https://github.com/Schmavery/facebook-chat-api) are outdated. This shouldn't be a problem as the project isn't serving to the public.
 
## License
Idk I'm not a lawyer but like you can use it or whatever. Just give credit because that's nice, please 🥹.

## Contributing
Pull requests are welcome!