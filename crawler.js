
require('dotenv').config();

const MAX_PAGES         = 1000;

const startUrl = process.env.START_URL;
const userName = process.env.VISUALPING_USERNAME;
const password = process.env.VISUALPING_PASSWORD;

if(!startUrl || !userName || !password) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}


// Extract actual URL from the START_URL query parameter
const url       = new URL(startUrl);
const finalUrl  = url.searchParams.get('q');

if (!finalUrl) {
    console.error('No URL found in the START_URL query parameter.');
    process.exit(1);
}
const startOrigin = new URL(finalUrl).origin;

const auth = Buffer.from(`${userName}:${password}`).toString('base64');


const passwords = new Set();
const visited   = new Set();

const passwordPattern   = /VISUALPING\{[0-9a-fA-F]{16}\}/g;
const linkPattern       = /(?:href|src)=["']([^"']+)["']/g;



async function crawl(currentUrl) {
    let normalizedUrl;

    // Normalize the URL
    try {
        const parsedUrl = new URL(currentUrl);
        parsedUrl.hash = ''; 
        normalizedUrl = parsedUrl.href;
    } catch (error) {
        console.error('Error parsing URL:', currentUrl, error);
        return;
    }
   

    // Avoid duplicate visits
    if (visited.has(normalizedUrl)) {
        return;
    }

    // Safety limit
    if(visited.size >= MAX_PAGES) {
        console.log(`Reached maximum limit of ${MAX_PAGES} pages. Stopping crawl.`);
        return;
    }

    visited.add(normalizedUrl);
    
    console.log('\nVisiting :', normalizedUrl);

    try {
        const response = await fetch(currentUrl, {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    });

    // Check HTTP response
    if (!response.ok) {
        console.error(`Failed to fetch ${currentUrl}. Status: ${response.status}`);
        return;
    }

    const contentType = response.headers.get('content-type') || '';
    
    console.log(`Content-Type: ${contentType}`);

    // Read the response text 
    const text = await response.text();

   //-------------------------------------
   // SEARCH EVERY RESORUCE FOR PASSWORDS
   //-------------------------------------

    const matches = text.match(passwordPattern);

    if(matches){
        matches.forEach(foundPassword => {
            if (!passwords.has(foundPassword)) {
                passwords.add(foundPassword);
                 console.log(' New Passwords found!');
                 currentUrl
            }
        });
    }

    console.log('Total Passwords found:', passwords.size);


    //-------------------------------------
    // NON HTML
    //-------------------------------------
    // CSS, JS, Images, etc. were already searched 
    // for passwords above.

    

    if(contentType.includes('text/css')) {
        const cssUrlPattern = /url\((['"]?)(.*?)\1\)/g;

        let cssMatch;

        while ((cssMatch = cssUrlPattern.exec(text)) !== null) {
            const resource = cssMatch[2];
            try {
                const resolved = new URL(resource, normalizedUrl).href;
                await crawl(resolved);
            } catch (error) {
                console.error('Could not parse CSS resource URL:', resource, error.message);
            }
        }
        return;
    }

    if (!contentType.includes('text/html')) {
        console.log('Finished  scanning non-HTML content.', normalizedUrl);
        return;
    }


    

   //-------------------------------------
   // DISCOVER href AND src 
   //-------------------------------------
   
    const links = [];

    let match;

    while ((match = linkPattern.exec(text)) !== null) {
        links.push(match[1]);
    }

    //-------------------------------------
    // CRAWL LINKS
    //------------------------------------- 

    for (const link of links) {
       
        try {
            const parsedUrl = new URL(link, normalizedUrl);
            
            parsedUrl.hash  = ''; 

            // only http and https links
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                continue; 
            }

            const newOrigin = parsedUrl.origin;
            const newUrl    = parsedUrl.href;

            if (newOrigin !== startOrigin) {
                continue; 
            }
            
            const pageNumber = parsedUrl.searchParams.get('page');
            
    

            await crawl(newUrl);

        } catch (error) {
            console.error('Could not parse URL:', link, error.message);
        }
       
    }    
    
    } catch (error) {
        console.error('Error fetching URL:', currentUrl, error.message);
    }

   
    
}


crawl(finalUrl).then(() => {
    console.log('\n ===============================');
    console.log('\tCrawling completed. ');
    console.log('\n ===============================');
    console.log('Total Visited.', visited.size);
    console.log('Total passwords found:', passwords.size);
});

