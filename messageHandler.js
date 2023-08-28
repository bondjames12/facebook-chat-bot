const chatBot = require("./openAI.js");

async function handleMessage(api, message) {
    switch (message.type) {
        case "message":
        case "message_reply":
            console.log(message);

            // handle message to the bot
            if (message.body.length > 0 && message.senderID) {
                const stayOnFor = process.env.STAY_ON_FOR;
                let trigger = false;

                if (message.mentions && message.mentions[api.getCurrentUserID()]) {
                    trigger = true;
                }

                api.getUserInfo(message.senderID, async (err, arr) => {
                    let response = await chatBot.smartBot(message.body, arr[message.senderID].name, trigger, stayOnFor, message.threadID);

                    if (response.length > 0) {
                        api.sendMessage(response, message.threadID, (err, info) => {
                            trigger = false;
                        }, message.messageID);
                    }
                });
            }

            // handle image generation
            if (message.body.slice(0, 5).trim() == "-pic") {

                chatBot.getPicResponse(api, message.body.slice(4).trim(), message.threadID, message.messageID);

            }

        break;
    }
}

module.exports = handleMessage;
