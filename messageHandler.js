const chatBot = require("./src/openAI.js");
const calculate = require("./src/calculate.js");

async function handleMessage(api, message) {
    switch (message.type) {
        case "message":
        case "message_reply":
            
            console.log(`Message: ${message.body.replace(/\n+/g, ' ')} 
Thread ID: ${message.threadID}\n`);

            // handle message to the bot
            if (message.body.length > 0 && message.senderID && message.body.slice(0,1) != "-" && message.body.slice(0,1) != "/") {
                const stayOnFor = process.env.STAY_ON_FOR;
                let trigger = false;

                // if message contains tag of bot ID set trigger to true OR is a reply to bot
                if ((message.mentions && message.mentions[api.getCurrentUserID()]) || (message.messageReply && message.messageReply.senderID == api.getCurrentUserID())) {
                    trigger = true;
                }

                // get name/nickname used in tag so it can be passed to the AI
                if(message.mentions && message.mentions[api.getCurrentUserID()]){
                    nickName = message.mentions[api.getCurrentUserID()]
                }

                // if no tag name, use whatever name is defined in the environment variable
                else{
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

                    let response = await chatBot.smartBot(message.body, arr[message.senderID].name, nickName, trigger, stayOnFor, message.threadID, message.messageID, api);

                    // smartBot function replies with -pic[prompt] if prompted to make picture. This statement just blocks that reply
                    if (response.length > 0 && response.slice(0,1) != "-") {

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

            break;

        default:
            //console.log(`Alternate message type: ${message.type} in thread ID: ${message.threadID}`);
    }
}

module.exports = handleMessage;
