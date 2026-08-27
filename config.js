require('dotenv').config();

const MAX_BROWSER_PAGES = 1010;
const MAX_LENGTH        = 10;
const EXAMPLE_PASSWORD  = 'VISUALPING{0000deadbeef0000}';

const startUrl = process.env.START_URL;
const userName = process.env.VISUALPING_USERNAME;
const password = process.env.VISUALPING_PASSWORD;


if(!startUrl || !userName || !password) {
    throw new Error('Missing required environment variables. Please check your .env file.');

}

// Extract actuual URL from the START_URL query parameter
const url       = new URL(startUrl);
const finalUrl  = url.searchParams.get('q');

if(!finalUrl) {
    throw new Error('Start_URL does not contain a q parameter');
}

const origin    = new URL(finalUrl).origin;

module.exports = {
    MAX_BROWSER_PAGES,
    MAX_LENGTH,
    EXAMPLE_PASSWORD,
    userName,
    password,
    finalUrl,
    origin
};