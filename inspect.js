require('dotenv').config();

const startUrl = process.env.START_URL;
const userName = process.env.VISUALPING_USERNAME;
const password = process.env.VISUALPING_PASSWORD;

if(!startUrl || !userName || !password) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}


// Extract actuual URL from the START_URL query parameter
const finalUrl = new URL(startUrl).searchParams.get('q');
const origin = new URL(finalUrl).origin;

const auth = Buffer.from(`${userName}:${password}`).toString('base64');

const resources = [
    '/static/js/main.js',
    '/static/js/widgets.js',
    '/static/js/telemetry.js',
    '/static/js/carousel.js',
    '/static/js/analytics.js'
];

async function inspect() {
    for(const resource of resources) {
        const url = new URL(resource, origin).href;
        const response = await fetch(url, {
            headers:{
                Authorization: `Basic ${auth}`
            }
        });
        const text = await response.text();
        console.log('\n=================');
        console.log(resource);
        console.log('Status: ', resource.status);
        console.log('Length: ', text.length);
        console.log("=====================");

        console.log(text)
    }
}

inspect();