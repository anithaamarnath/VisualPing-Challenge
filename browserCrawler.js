require('dotenv').config();
const {chromium} = require('playwright');


const fs = require('fs');
const { dir } = require('console');


const MAX_BROWSER_PAGES = 1010;
const EXAMPLE_PASSWORD = 'VISUALPING{0000deadbeef0000}';

const startUrl = process.env.START_URL;
const userName = process.env.VISUALPING_USERNAME;
const password = process.env.VISUALPING_PASSWORD;

if(!startUrl || !userName || !password) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Extract actuual URL from the START_URL query parameter
const url       = new URL(startUrl);
const finalUrl  = url.searchParams.get('q');

const passwords = new Set();
const visited   = new Set();
const queue     = [finalUrl];
const origin    = new URL(finalUrl).origin;




const passwordPattern   = /VISUALPING\{[0-9a-fA-F]{16}\}/g;

function scanText(text, sourceUrl) {

    if(!text || typeof text !== 'string') {
        return;
    }

    const directMatches = text.match(passwordPattern);

    if(directMatches) {
        for(const foundPassword of directMatches) {
            if( foundPassword !== EXAMPLE_PASSWORD &&
                !passwords.has(foundPassword)) {
                    passwords.add(foundPassword);
                console.log('\n==============')
                console.log('*** New Password Found **');
                console.log('Password:', foundPassword);
                console.log("Source: ", sourceUrl);
                console.log('==============\n')
            }
        }
    }

    // Decimal character-code 
    const arrayPattern = /\[((?:\s*\d+\s*,?)+)\]/g;

    let arrayMatch;

    while((arrayMatch = arrayPattern.exec(text)) !== null) {
        const numbers = arrayMatch[1].split(',').map(value => Number(value.trim())).filter(Number.isFinite);
        
        if(numbers.length < 10) {
            continue;
        }

        const decoded = String.fromCharCode(...numbers);
        const decodedMatches = decoded.match(passwordPattern);

        if(!decodedMatches){
            continue;
        }

 
        for(const foundPassword of decodedMatches) {
            if(foundPassword !== EXAMPLE_PASSWORD &&
                !foundPassword.has(password)) {
                passwords.add(foundPassword);
                console.log('\n==============')
                console.log('**** DECODED PASSWORd FOUND *** ');
                console.log('SOURCE: ',sourceUrl);
                console.log('==============\n')
            }
        }
       

        

}
}

async function run() {
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true
    });

    const context = await browser.newContext({
        httpCredentials: {
            username: userName,
            password: password
        }
    });

    const page = await context.newPage();

    const networkUrls       = new Set();
   
    const inspectedScripts  = new Set();


    page.on('response', async response => {
        try {
            const status = response.status();

            if(status >=300 && status < 400) {
                return;
            }

            // const responseUrl =  response.url();

           const contentType = response.headers()['content-type'] || '';
            
            

            // const isTextResponse = contentType.includes('text/') ||
            //         contentType.includes('javascript') ||
            //         contentType.includes('json') ||
            //         contentType.includes('xml') ||
            //         contentType.includes('svg');

            // if(!isTextResponse) {
            //     return;
            // }

            
            // console.log(status, contentType, response.url());

            const body  = await response.text();

            scanText(body,  response.url());
            // const matches =body.match(passwordPattern);

            // if(contentType.includes('text/css')) {
            //     const cssUrlPattern = /url\((['"]?)(.*?)\1\)/g;
            //         let cssMatch;

            //         while((cssMatch = cssUrlPattern.exec(body)) !== null){
            //             try {
            //                 const resourceUrl = new URL(cssMatch[2], response.url()).href;
            //                 const parsed = new URL(resourceUrl);

            //                 if(parsed.origin === origin && !visited.has(resourceUrl) && !queue.includes(resourceUrl)) {
            //                     queue.push(resourceUrl);
            //                     console.log('CS resource: ', resourceUrl);
            //                 }




            //             } catch(error) {
            //                 console.log('Error in css resource', error)
            //             }
            //         }

            // }

            // Javascript insepction

            // if(contentType.includes('javascript') && !inspectedScripts.has(response.url())) {
            //     inspectedScripts.add(response.url());
            //     const scriptName = new URL(response.url()).pathname.split('/').pop();

            //     fs.writeFileSync(`./${scriptName}`, body);

            //     console.log('Saved JS file: ', scriptName)
            //     console.log('\n=====================');
            //     console.log('JS FILE, ', response.url);
            //     console.log('=======================');

            //     console.log(body);
            // }

            // if(matches) {
            //     matches.forEach(password =>{
            //         passwords.add(password);
            //     });
                
            //     console.log('Password found', response.url())
            // }

            // Inspect Javascript response

            // if(contentType.includes('javascript')) {
            //     console.log('\nJS FILE: ', response.url);

            //     if(body.includes('fetch(')) {
            //         console.log(' -> Contains fetch()');
            //     }
            //     if(body.includes('atob(')) {
            //         console.log(' -> Contains atob()');
            //     }
            //     if(body.includes('.json')) {
            //         console.log(' -> References JSON');
            //     }
            //     if(body.includes('.txt')) {
            //         console.log(' -> Reference TXT');
            //     }
            //     if(body.includes('.svg')) {
            //         console.log(' -> References SVG');
            //     }
            // }
        } catch(error){
            console.log('erro', error)
        }
});

page.on('request' , request => {
    const resourceType = request.resourceType();
    const requestUrl   = request.url();

    if(['xhr', 'fetch', 'script', 'document'].includes(resourceType)) {
        networkUrls.add(requestUrl);

        console.log('Network:', resourceType, requestUrl);
    }
});




while (queue.length > 0 && visited.size < MAX_BROWSER_PAGES) {
    const currentUrl = queue.shift();

    if(visited.has(currentUrl)) {
        continue;
    }

    visited.add(currentUrl);

    console.log(`Browser visiting ${visited.size}:`, currentUrl);

    try {
        await page.goto(currentUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        await page.waitForTimeout(500);

        const renderedHtml = await page.content();
        // const renderedMatches = renderedHtml.match(passwordPattern);
        // const renderedMatches = 
        scanText(renderedHtml, currentUrl)

        // if(renderedMatches) {
        //     renderedMatches.forEach(password => {
        //         passwords.add(password);
        //     });

        // }
        console.log('Password found: ', passwords.size)

    } catch (error) {
        console.log('Navigation failed:', currentUrl, error.message);
        continue;
    }

    // const links = await page.locator('a').evaluateAll(elements => elements.map(element => element.href));

    // console.log('Links discovered:', links.length);

    const resources = await page.evaluate(() => {
        const found = new Set();
        

        document.querySelectorAll('*').forEach(element => {
            for(const attr of ['href', 'src', 'action']) {
                const value = element.getAttribute(attr);

                if(!value) continue;

                
                    try {
                        found.add(new URL(value, window.location.href).href);
                    } catch {}
                
            }
        });
        return [...found];
    })


    for(const link of resources) {
    try {
        const parsedUrl = new URL(link);
        parsedUrl.hash  = '';


            if(parsedUrl.origin !== origin) {
                continue;
            }
            const normalized = parsedUrl.href;

            if(!visited.has(normalized) && !queue.includes(normalized)) {
                queue.push(normalized);
            }

        } catch (error) {
            console.log('could not visit: ', link);
        }
}
for(const networkUrl of networkUrls) {
    try{
        const parsed = new URL(networkUrl);
        parsed.hash = '';

        if(parsed.origin != origin) {
            continue;
        }
       
        const normalized = parsed.href;

        if(!visited.has(normalized) && !queue.includes(normalized)) {
            queue.push(normalized)
        }
    } catch(error) {
        console.log('Invalid  network URL: ', networkUrl)
    }
}
networkUrls.clear();

}



console.log('\nBrowser crawl completed:');
console.log('Broswer pages visited:  ', visited.size);
console.log(' passwords found: ', passwords.size);
console.log('Remaining queue: ', queue.length);

console.log('\n==================');
console.log('Final Password');
console.log('=====================')

for(const foundPassword of passwords) {
    console.log(foundPassword);
}

if(queueMicrotask.length > 0) {
    console.log("\nRemaining URLs:");

    for (const remainingUrl of queue) {
        console.log(remainingUrl);
    }
 }

await browser.close();

}

run();
 

