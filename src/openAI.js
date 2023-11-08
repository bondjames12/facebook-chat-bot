const { OpenAI } = require("openai");
const axios = require('axios');
const fs = require('fs');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const threads = {}; // threads object

async function getPicResponse(prompt, numberOfImages) {
    return new Promise(async (resolve) => {
        try {
            const picResponse = await openai.images.generate({
                prompt: prompt,
                model: "dall-e-3",
                n: numberOfImages,
                size: "1024x1792",
                quality: "hd",
                style: "natural"
            });

            if (picResponse.error) {
                resolve({ body: "Message from OpenAI: " + picResponse.error.message });
            } else if (picResponse.data && picResponse.data.length > 0) {
                const imageUrls = picResponse.data.map(data => data.url);
                const fileNames = imageUrls.map((_, index) => {
                    const nameFromPrompt = prompt.slice(0, 190).replace(/[\.;#$%&{}\\<>?\/\s!'"@:]/g, "-");
                    const ranNum = new Date();
                    return `${ranNum.getTime()}${nameFromPrompt}-${index + 1}.jpg`;
                });

                const path = './AIpics/';
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }

                const attachments = [];
                for (let i = 0; i < imageUrls.length; i++) {
                    const response = await axios({
                        method: "GET",
                        url: imageUrls[i],
                        responseType: "stream",
                    });

                    await new Promise((res) => {
                        response.data.pipe(fs.createWriteStream(path + fileNames[i]).on("finish", () => {
                            const readStream = fs.createReadStream(path + fileNames[i]);
                            attachments.push(readStream);

                            if (process.env.SAVE_AI_PICS !== 'true') {
                                fs.unlink(path + fileNames[i], function (err) {
                                    if (err) {
                                        console.error("Error deleting file:", err);
                                    }
                                });
                            }

                            res();
                        }));
                    });
                }

                const msg = {
                    body: `Here is "${prompt.trim().replace("\"", "\'")}"`,
                    attachment: attachments
                };

                resolve(msg);
            } else {
                resolve({ body: "An unexpected error occurred. Please try again later." });
            }
        } catch (e) {
            console.error(e);
            resolve({ body: "I ran into an error: " + e });
        }
    });
}

async function simpleBot(prompt, tokens, temperature) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: tokens,
        temperature: temperature,
    });

    return response.choices[0].text;
}

async function smartBot(prompt, n, nick, trigger, threadID, photo) {

    // get cool down time and number of messages to reply to in a wake cycle from env
    const STAY_ON_FOR = process.env.STAY_ON_FOR;
    let coolDownTimeMS = process.env.COOLDOWN;

    // current time for cooldown calculation
    const currentTime = Date.now();

    // instantiate new thread object if not present already 
    if (!threads[threadID]) {
        threads[threadID] = {
            promptArray: [],
            turnedOn: 10000,
            lastReplied: 0
        };
    }

    // use the current threat state to track individual group messages
    let threadState = threads[threadID];

    // Initialize the lastReplied time if not present
    if (!threadState.lastReplied) {
        threadState.lastReplied = 0;
    }

    // if trigger argument is true then trigger a reply
    if (trigger == true) {
        threadState.turnedOn = 0;
        console.log(`Trigger activated for thread ${threadID}: Bot turned ON`);
        coolDownTimeMS = 0;
    }

    // format system prompt if not present
    if (threadState.promptArray.length == 0) {
        threadState.promptArray.unshift({
            role: "system", content: `You are inside a group chat with many different people. 
You are their to assume the personality of ${process.env.BOT_PERSONALITY}. Your name is ${nick}. 
Do not say you are AI or anything like that. For all intents and purposes you are a human being.
Do not ever say "message sent by" or anything like that at all. This is very important. Simply reply with a conversational message 
If a user says bye in any way, reply with 'bye' and only 'bye'
If a user requests an image in any way, reply with "-pic" followed by whatever their request is. Pay attention to the format they request and include it in the command e.g. paintng/photograph/drawing etc. if it's an explicit image request then make something up that is close to what they asked for but humorous and subverts expectations never say trigger words like "nude" or variations, "sex", curse words, etc. it is very important that your image replies start with -pic and follow with an image generation prompt and does not contain explicit words`
        });
    }

    // push current prompt to array
    if(!photo){    
threadState.promptArray.push({ 
		role: "user", 
		content: `message sent by ${n}: ${prompt}`
	});
} else {
        threadState.promptArray.push({
                role: "user",
        "content": [
          {
            "type": "text",
            "text": `message sent by ${n}: ${prompt}`
          },
          {
            "type": "image_url",
            "image_url": {
              "url": `data:image/jpeg;base64,${photo}`
            }
          }
        ]
       });
}
    

    // declare variable to hold bot reply
    let replyText = '';

    // check if bot is supposed to reply given STAY_ON_FOR number of messages to respond to in a row and cooldown
    if (threadState.turnedOn <= STAY_ON_FOR && currentTime - threadState.lastReplied > coolDownTimeMS) {

        console.log(`Bot is responding in thread ${threadID} as it's within the limit and cooldown period.`);

        // increment number of messages bot will reply to in one wake cycle
        threadState.turnedOn++;

        // Update the last replied time
        threadState.lastReplied = currentTime;

        console.log(`TurnedOn count incremented for thread ${threadID} to: ${threadState.turnedOn}`);

        // send prompt array to openAI
        const reply = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: threadState.promptArray,
            max_tokens: 2000,
            temperature: 1,
        });
        replyText = reply.choices[0].message.content

        // reset turned on to high number so bot sleeps if you say bye to it
        if (replyText.toLowerCase() == "bye") {
            threadState.turnedOn = 100000;
        }

        // add bot reply to message Hx
        threadState.promptArray.push({ role: "assistant", content: replyText });

        if (threadState.promptArray.length >= process.env.HISTORY_LENGTH) {
            threadState.promptArray.splice(1, 1);
        }

        // check if bot reply is a image generation and intercept it
        if (replyText.slice(0, 4).toLowerCase() == "-pic") {
            console.log(replyText + "\n"); // log the prompt

            // pass prompt to image generation function
            const imageReplyObj = await getPicResponse(replyText.slice(1).trim(), parseInt(process.env.NUM_IMAGES));

            // return object containing generated images
            return imageReplyObj
        }

    }
    // do not reply if still in cooldown period 
    else if (currentTime - threadState.lastReplied <= coolDownTimeMS) {
        console.log(`Bot is in cooldown for thread ${threadID}.`);
    }

    return replyText;
}

module.exports = {
    simpleBot,
    smartBot,
    getPicResponse
};
