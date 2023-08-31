const chatBot = require("./src/openAI.js");
const calculate = require("./src/calculate.js");

async function handleMessage(api, message) {
    switch (message.type) {
        case "message":
        case "message_reply":
            
            console.log(`Message: ${message.body} in thread ID: ${message.threadID}`);

            // handle message to the bot
            if (message.body.length > 0 && message.senderID && message.body.slice(0,1) != "-") {
                const stayOnFor = process.env.STAY_ON_FOR;
                let trigger = false;

                // if message contains tag of bot ID set trigger to true OR is a reply to bot
                if ((message.mentions && message.mentions[api.getCurrentUserID()]) || (message.messageReply && message.messageReply == api.getCurrentUserID())) {
                    trigger = true;
                }

                // pass in true trigger value to bot to start wake cylce
                api.getUserInfo(message.senderID, async (err, arr) => {
                    let response = await chatBot.smartBot(message.body, arr[message.senderID].name, trigger, stayOnFor, message.threadID);

                    if (response.length > 0) {
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

            if (message.body.slice(0, 5).trim() == "-cat") {
                result = calculate.cat(message.body.slice(4).trim());
                api.sendMessage(result, message.threadID, message.messageID);
            }

            break;

        default:
            //console.log(`Alternate message type: ${message.type} in thread ID: ${message.threadID}`);
    }
}

module.exports = handleMessage;
