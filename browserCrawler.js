
const {chromium} = require('playwright');

const {
    MAX_BROWSER_PAGES,
    EXAMPLE_PASSWORD,
    userName,
    password,
    finalUrl,
    origin
} = require('./config');

const {
    scanText,
    enqueueUrl,
    saveJavaScript,
    discoverDomResources,
    discoverCSSResources
} = require('./helper')



const passwords = new Set();
const visited   = new Set();
const queue     = [finalUrl];
 
const networkUrls = new Set();
const inspectedScripts = new Set();



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

    setupResponseHandler(page);
    setupRequestHandler(page);

    await crawlPages(page);

    printResults();

    await browser.close();

}

    function setupResponseHandler(page) {
        page.on('response', async response => {
            try {
                const status = response.status();
                const responseUrl =  response.url();
                const contentType = response.headers()['content-type'] || '';


                if(status >=300 && status < 400) {
                    return;
                }

                const isTextResponse = contentType.includes('text/') ||
                        contentType.includes('javascript') ||
                        contentType.includes('json') ||
                        contentType.includes('xml') ||
                        contentType.includes('svg');

                if(!isTextResponse) {
                    return;
                }


                const body  = await response.text();

                scanText(body, responseUrl, passwords, EXAMPLE_PASSWORD);

                if(contentType.includes('javascript')) {
                    saveJavaScript(responseUrl, body, inspectedScripts);
                }

                if(contentType.includes('text/css')) {
                    const cssResources = discoverCSSResources(body, responseUrl);
                    for(const resourceUrl of cssResources) {
                        enqueueUrl(resourceUrl, origin, visited, queue);
                    }

                }

                
            } catch(error){
                console.log('erro', error)
            }

           
});

    }

    function setupRequestHandler(page) {
        page.on('request' , request => {
            const resourceType = request.resourceType();
           

            if(['xhr', 'fetch', 'script', 'document'].includes(resourceType)) {
                networkUrls.add(request.url());

            }
        });


    }

    async function crawlPages(page) { 
        while (queue.length > 0 && visited.size < MAX_BROWSER_PAGES) {
            const currentUrl = queue.shift();

            if(!currentUrl) {
                continue;
            }

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

    } catch (error) {
        console.log('Navigation failed:', currentUrl, error.message);
        continue;
    }

    await inspectRenderPage(page, currentUrl);
    await addDiscoveredResources(page);
    networkUrls.clear();
}
    }

    async function  inspectRenderPage(page, currentUrl) {
        const renderedHtml = await page.content() 
        
         scanText(renderedHtml, currentUrl, passwords, EXAMPLE_PASSWORD);

         console.log('Password found', passwords.size);


}

async function addDiscoveredResources(page) {
    const resources = await discoverDomResources(page);

    for(const resource of resources) {
        enqueueUrl(resource, origin, visited, queue);
    }
}

function addNetworkResources() {
    for(const networkUrl of networkUrls) {
        enqueueUrl(networkUrl,origin, visited, queue);
        
    }
}

function printResults() {
    console.log('\n=======================');
    console.log('Browser crawl completed');
    console.log("=================");
    console.log("Browser pages visited: ", visited.size);
    console.log('Reaminign queue:' , queue.length);
    console.log("Paswords found:", passwords.size);
    comsole.log('FINAL PASSWORDS');
    console.log('===============');
    
    for(const foundPassword of passwords) {
        console.log(foundPassword);
    }

}












run().catch(error => {
    console.error(
        'Crawler failed',
        error
    );
    process.exit(1);
});
 

