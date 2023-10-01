const chatBot = require("./src/openAI.js");
const calculate = require("./src/calculate.js");
const fs = require('fs');

let leekSpinUsers = {};
let editImageList = {};
let editImagePrompts = {};

function getUserSpinStartTime(senderID, threadID) {
    if (!leekSpinUsers[senderID]) {
        return 0;
    }
    return leekSpinUsers[senderID][threadID] || 0;
}

async function handleMessage(api, message) {

    console.log(`Message: ${message.body.replace(/\n+/g, ' ')}\nThread ID: ${message.threadID}\n`);

    // handle message to the bot
    if (message.body.length > 0 && message.senderID && message.body.slice(0, 1) != "-" && message.body.slice(0, 1) != "/") {
        let COOLDOWN_TIME_MS = process.env.COOLDOWN; // bot reply cool down time 
        const stayOnFor = process.env.STAY_ON_FOR;
        let trigger = false;

        // if message contains tag of bot ID set trigger to true OR is a reply to bot
        if ((message.mentions && message.mentions[api.getCurrentUserID()]) || (message.messageReply && message.messageReply.senderID == api.getCurrentUserID()) || !message.isGroup) {
            
            // turn off cool down if message is direct message
            if(!message.isGroup){
                COOLDOWN_TIME_MS = 0;
            }
            trigger = true;
        }

        // get name/nickname used in tag so it can be passed to the AI
        if (message.mentions && message.mentions[api.getCurrentUserID()]) {
            nickName = message.mentions[api.getCurrentUserID()]
        }

        // if no tag name, use whatever name is defined in the environment variable
        else {
            nickName = process.env.BOT_NAME
        }

        // get sender's name and pass to bot inside callback
        api.getUserInfo(message.senderID, async (err, arr) => {
            if (err) console.error("Error getting user info!")

            /* 
            smartBot function Arguments:
            -message, 
            -message sender's name, 
            -the tag/nick name, 
            -how many messages in this wake cycle
            -trigger true to trigger a reply - false adds message to thread history but does not trigger a wake/reply cycle
            -messageID
            -threadID
            -api - to call chat api functions inside smartBot file
            */

            let response = await chatBot.smartBot(message.body, arr[message.senderID].name, nickName, trigger, stayOnFor, message.threadID, message.messageID, api, COOLDOWN_TIME_MS);

            // smartBot function replies with -pic[prompt] if prompted to make picture. This statement just blocks that reply
            if (response.length > 0 && response.slice(0, 1) != "-") {

                // send AI reply/response to thread, resetting the trigger variable on callback and sending as a message_reply
                api.sendMessage(response, message.threadID, () => {
                    trigger = false;
                }, message.messageID);
            }
        });
    }

    // handle image generation
    if (message.body.slice(0, 5).trim() == "-pic") {
        chatBot.getPicResponse(api, message.body.slice(4).trim(), message.threadID, message.messageID);
    }

    // calculator
    if (message.body.slice(0, 6).trim() == "-math") {
        result = calculate.calculateMathExpression(message.body.slice(5).trim());
        api.sendMessage(result.toString(), message.threadID, message.messageID);
    }

    // cat
    if (message.body.slice(0, 5).trim() == "-cat") {
        result = calculate.cat(message.body.slice(4).trim());
        api.sendMessage(result, message.threadID, message.messageID);
    }

    if (message.body.toLowerCase().startsWith("leekspin")) {

        const readStream = fs.createReadStream("./resources/leekspin.gif");
        const userSpinStartTime = getUserSpinStartTime(message.senderID, message.threadID);

        const command = message.body.toLowerCase().slice(9);
        let msg;

        switch (command) {
            case 'start':
                if (!leekSpinUsers[message.senderID]) {
                    leekSpinUsers[message.senderID] = {};
                }
                leekSpinUsers[message.senderID][message.threadID] = new Date();
                msg = {
                    body: "Spinning started...",
                    attachment: readStream,
                };
                break;

            case 'stop':
                if (leekSpinUsers[message.senderID]) {
                    leekSpinUsers[message.senderID][message.threadID] = 0;
                }
                msg = { body: "Spinning stopped..." };
                break;

            default:
                if (message.body.toLowerCase() === "leekspin") {
                    if (userSpinStartTime !== 0) {
                        const currentLeekTime = new Date();
                        const leekTimeInSeconds = (currentLeekTime - userSpinStartTime) / 1000;
                        msg = {
                            body: `You've been spinning for ${calculate.formatDuration(Math.trunc(leekTimeInSeconds))}.`,
                            attachment: readStream,
                        };
                    } else {
                        msg = { body: "You haven't started spinning!" };
                    }
                }
                break;
        }

        if (msg) {
            api.sendMessage(msg, message.threadID, message.messageID);
        }
    }

    if (!editImageList[message.senderID ] && message.body.slice(0,6).trim() == "-edit"){
        editImageList[message.senderID] = true;
        editImagePrompts[message.senderID] = calculate.generateRandomString(10);
        api.sendMessage("Please send an image to edit", message.threadID, message.messageID);
    }
    if (editImageList[message.senderID] && message.attachments[0] && message.attachments[0].type == "photo"){
        editImageList[message.senderID] = false;
        info = {
            api: api,
            threadID: message.threadID,
            messageID: message.messageID
        }
        chatBot.picEdit(message.attachments[0].url, editImagePrompts[message.senderID], info)
    }

    

}

module.exports = handleMessage;
