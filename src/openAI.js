const { OpenAI } = require("openai");
const axios = require('axios');
const fs = require('fs');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const threads = {}; // threads object
const COOLDOWN_TIME_MS = process.env.COOLDOWN; // bot reply cool down time 

async function getPicResponse(api, prompt, id1, id2) {

    try {
        // generate image
        const picResponse = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        // send the error message if OpenAI returns one
        if (picResponse.error) {
            api.sendMessage("Message from OpenAI: " + picResponse.error.message, id1, id2);
        } else if (picResponse.data && picResponse.data[0].url) { //Check if the response from OpenAI contains the link we need

            // declare some variables and do some regex
            const imageUrl = picResponse.data[0].url;
            const nameFromPromt = prompt.slice(0, 190).replace(/[\.;#$%&{}\\<>?\/\s!'"@:]/g, "-");
            const ranNum = String(Math.floor(Math.random() * 100000) + 1); // generate random number so duplicate prompts have unique filenames... usually
            const fileName = `${ranNum}${nameFromPromt}.jpg`

            //prepare to download the link that OpenAI sent back that contains the picture generated by the user
            const response = await axios({
                method: "GET",
                url: imageUrl,
                responseType: "stream",
            });

            // pic save path
            const path = './AIpics/';

            // create directory if it does not exist
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }

            // download the picture
            response.data.pipe(fs.createWriteStream(path + fileName).on("finish", function () {
                const readStream = fs.createReadStream(path + fileName); //prepare to send to messenger

                // format the message to include the picture and snarky remark + prompt
                const msg = {
                    body: "uhh here is \"" + prompt.trim().replace("\"", "\'") + "\" for whatever reason. ",
                    attachment: readStream,
                };

                // SEND IT
                api.sendMessage(msg, id1, id2);

                // delete the file if process.env.SAVE_AI_PICS is not true
                if (process.env.SAVE_AI_PICS !== 'true') {
                    fs.unlink(path + fileName, function (err) {
                        if (err) {
                            console.error("Error deleting file:", err);
                        }
                    });
                }



            }));
        } else {
            api.sendMessage("An unexpected error occurred. Please try again later.", message.threadID);
        }
    }
    catch (e) {
        api.sendMessage("API Error!\n" + e.error.message, id1, id2);
    }
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

async function smartBot(prompt, n, trigger, stayOn, threadID, id2, api) {

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
        threadState.turnedOn = 1;
        console.log(`Trigger activated for thread ${threadID}: Bot turned ON`);
    }

    // format system prompt if not present
    if (threadState.promptArray.length == 0) {
        threadState.promptArray.unshift({
            role: "system", content: `You are inside a group chat with many different people. 
        You are their friendly assistant. Your name is ${process.env.BOT_NAME}. 
        Do not say you are AI or anything like that. For all intents and purposes you are a human being.
        Do not say "message sent by" or anything like that at all. Simply reply with a conversational message 
        If a user says bye in any way, reply with 'bye' and only 'bye'
        if a user requests a picture in any way, reply with "-pic" following by whatever their request is`});
    }

    // push current prompt to array
    threadState.promptArray.push({ role: "user", content: `message sent by ${n} ${prompt}` });

    // declare variable to hold bot reply
    let replyText = '';

    // check if bot is supposed to reply given stayOn number of messages to respond to in a row and cooldown
    if (threadState.turnedOn < stayOn && currentTime - threadState.lastReplied > COOLDOWN_TIME_MS) {

        console.log(`Bot is responding in thread ${threadID} as it's within the limit and cooldown period.`);

        // send prompt array to openAI
        const reply = await openai.chat.completions.create({
            model: "gpt-4",
            messages: threadState.promptArray,
            max_tokens: 100,
            temperature: 1,
        });
        replyText = reply.choices[0].message.content
        // reset turned on to high number so bot sleeps if you say bye to it
        if (replyText == "bye") {
            threadState.turnedOn = 100000;
        }
        
        if (replyText.slice(0, 4) == "-pic") {
            getPicResponse(api, replyText.slice(4).trim(), threadID, id2);
        }

        // add bot reply to message Hx
        threadState.promptArray.push({ role: "assistant", content: replyText });

        if (threadState.promptArray.length >= process.env.HISTORY_LENGTH) {
            threadState.promptArray.splice(1, 1);
        }

        // increment number of messages bot will reply to in one wake cycle
        threadState.turnedOn++;

        // Update the last replied time
        threadState.lastReplied = currentTime;

        console.log(`TurnedOn count incremented for thread ${threadID} to: ${threadState.turnedOn}`);

        // do not reply if still in cooldown period 
    } else if (currentTime - threadState.lastReplied <= COOLDOWN_TIME_MS) {
        console.log(`Bot is in cooldown for thread ${threadID}.`);
    }

    return replyText;
}


module.exports = {
    simpleBot,
    smartBot,
    getPicResponse
};
