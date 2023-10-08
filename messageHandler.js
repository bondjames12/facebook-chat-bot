const chatBot = require("./src/openAI.js");
const calculate = require("./src/calculate.js");
const fs = require('fs');

let leekSpinUsers = {};

async function handleMessage(api, message) {

    // console log messages read by bot
    console.log(`Message: ${message.body.replace(/\n+/g, ' ')}\nThread ID: ${message.threadID}\n`);

    // handle message to the bot
    if (message.body.length > 0 && message.senderID && message.body.slice(0, 1) != "-" && message.body.slice(0, 1) != "/") {
        let trigger = false;

        // if message contains tag of bot ID OR is a reply to bot OR is direct message, set trigger to true 
        if ((message.mentions && message.mentions[api.getCurrentUserID()]) || (message.messageReply && message.messageReply.senderID == api.getCurrentUserID()) || !message.isGroup) {
            trigger = true;
        }

        // get name/nickname used in tag so it can be passed to the AI
        if (message.mentions && message.mentions[api.getCurrentUserID()]) {
            nickName = message.mentions[api.getCurrentUserID()]
        }

        // if no tag name, use whatever name the bot account is named
        else {
            // function to get bot account name
            async function getBotName() {
                return new Promise((resolve, reject) => {
                    api.getUserInfo(api.getCurrentUserID(), (err, arr) => {
                        if (err) {
                            console.error("Error getting bot info!");
                            reject(err); // Reject the promise with the error
                        } else {
                            const name = arr[api.getCurrentUserID()].name;
                            resolve(name); // Resolve the promise with the name
                        }
                    });
                });
            }
            nickName = await getBotName();
        }

        // get sender's name and pass to bot 
        api.getUserInfo(message.senderID, async (err, arr) => {
            if (err) console.error("Error getting user info!")

            let response = await chatBot.smartBot(message.body, arr[message.senderID].name, nickName, trigger, message.threadID);

            // send AI reply/response to thread, resetting the trigger variable on callback and sending as a message_reply
            api.sendMessage(response, message.threadID, () => {
                trigger = false;
            }, message.messageID);

        });
    }

    // handle image generation
    if (message.body.slice(0, 5).trim() == "-pic") {
        let msg = await chatBot.getPicResponse(message.body.slice(4).trim(), parseInt(process.env.NUM_IMAGES));
        api.sendMessage(msg, message.threadID, message.messageID);
    }

    // calculator
    if (message.body.slice(0, 6).trim() == "-math") {
        result = calculate.calculateMathExpression(message.body.slice(5).trim());

        let explainOutput = [];
        for (let i = 0; i < result.explanation.length; i++) {
          explainOutput.push((i + 1) + ". " + result.explanation[i] + "\n");
        }

        api.sendMessage(result.result.toString() + (explainOutput.length == 0 ? "" : "\n\nSteps:\n" + explainOutput.join("")), message.threadID, message.messageID);
    }

    // cat
    if (message.body.slice(0, 5).trim() == "-cat") {
        result = calculate.cat(message.body.slice(4).trim());
        api.sendMessage(result, message.threadID, message.messageID);
    }

    if (message.body.toLowerCase().startsWith("leekspin")) {


        const readStream = fs.createReadStream("./resources/leekspin.gif");
        const userSpinStartTime = leekSpinUsers[message.senderID] ? (leekSpinUsers[message.senderID][message.threadID] || 0) : 0;

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
}

module.exports = handleMessage;
