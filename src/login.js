const puppeteer = require('puppeteer');
require('dotenv').config();

async function getModifiedCookie() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.facebook.com/');
    
    // Use environment variables for credentials
    await page.type('input[name="email"]', process.env.FB_EMAIL);
    await page.type('input[name="pass"]', process.env.FB_PASSWORD);
    await page.click('button[name="login"]');

    // Wait for navigation or any indicator that suggests a successful login
    await page.waitForNavigation();

    const cookies = await page.cookies();
    await browser.close();

    // Modify cookies
    return cookies.map(item => {
        if (item.name) {
            item.key = item.name;
            delete item.name;
        }
        return item;
    });
    
}

module.exports = getModifiedCookie;
