const login = require('facebook-chat-api');
const getModifiedCookie = require('./src/login');
const handleMessage = require('./messageHandler');

(async () => {
    const modifiedFbCookies = await getModifiedCookie();

    login(credential = { appState: modifiedFbCookies }, (err, api) => {
        if (err) return console.error(err);

        api.listenMqtt((err, message) => {
            if (message.type) {
                handleMessage(api, message);
            }
            else{
                console.error("Type error!\n" + message);
            }
        });
    });
})();
