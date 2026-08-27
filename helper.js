const fs = require('fs');
const {
    MAX_LENGTH 
} = require('./config');

const passwordPattern   = /VISUALPING\{[0-9a-fA-F]{16}\}/g;


/** 
 * Scan text for :
 * 1. Normal VISUALPING passwords
 * 2. Passwords encoded as character-code arrays
*/

function scanText(text, sourceUrl, passwords, examplePassword) {

    if(!text || typeof text !== 'string') {
        return;
    }

    const directMatches = text.match(passwordPattern);

    if(directMatches) {
        for(const foundPassword of directMatches) {
           addPassword(foundPassword,
            sourceUrl,
            passwords,
            examplePassword,
            'NEW PASSWORD FOUND'
           );
        }
    }


    const arrayPattern = /\[((?:\s*\d+\s*,?)+)\]/g;

    let arrayMatch;

    while((arrayMatch = arrayPattern.exec(text)) !== null) {
        
        const numbers = arrayMatch[1].split(',').map(value => Number(value.trim())).filter(Number.isFinite);
        
        if(numbers.length < MAX_LENGTH) {
            continue;
        }

        const decoded = String.fromCharCode(...numbers);

        const decodedMatches = decoded.match(passwordPattern);

        if(!decodedMatches) {
            continue;
        }

        
        for(const foundPassword of decodedMatches) {
            addPassword(
                foundPassword,
                sourceUrl,
                passwords,
                examplePassword,
                'DECODED PASSWORD FOUND'
            );
            
        }
        
    }
}

function addPassword(
    foundPassword,
    sourceUrl,
    passwords,
    examplePassword,
    label
) {
    if ( foundPassword === examplePassword) {
        return;
    }

    if( passwords.has(foundPassword)) {
        return;
    }

    passwords.add(foundPassword);

    console.log('\n===================');
    console.log(`*** ${label} ***`);
    console.log('Password:', foundPassword);
    console.log('Source:', sourceUrl);
    console.log('==================\n');
} 

function normalizedUrl(rawUrl) {
    const parsed = new URL(rawUrl);
    parsed.hash = '';
    return parsed.href;
}

function enqueueUrl(
    rawUrl,
    origin,
    visited,
    queue

) {
    try {
        const normalized = normalizedUrl(rawUrl);
        const parsed = new URL(normalized);

        if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return;
        }
        if(parsed.origin !== origin) {
            return;
        }

      

        if(visited.has(normalized)) {
            return;
        }

        if(queue.includes(normalized)) {
            return;
        }

        queue.push(normalized);

        
    } catch(error){

        console.log("Invalid", error.message);
    }
}

function saveJavaScript(
    resourceUrl,
    body,
    inspectedScripts
) {
    if(inspectedScripts.has(resourceUrl)) {
        return;
    }

    inspectedScripts.add(resourceUrl);

    const scriptName = new URL(resourceUrl).pathname.split('/').pop();

    if(!scriptName) {
        return;
    }

    fs.writeFileSync(`./${scriptName}`, body);
    console.log('Saved JavaScript:', scriptName);

}

async function discoverDomResources(page) {
    return page.evaluate(() => {
        const resource = new Set();

        document.querySelectorAll('*')
        .forEach(element => {
            for( const attribute of ['href', 'src', 'action']) {
                const value = element.getAttribute(attribute);

                if(!value) {
                    continue;
                }

                try {
                    resource.add(new URL(value, window.location.href).href);

                } catch(error) {
                    console.log("Invalid Dom resources :", error.message);
                }
            }
        });
        return [...resource];

    });
}

function discoverCSSResources(body, resourceUrl) {
    const resources = [];

    const cssUrlPattern = /url\((['"]?)(.*?)\1\)/g;

    let match;

    while((match = cssUrlPattern.exec(body)) !== null) {
        try {
            resources.push(new URL(match[2], resourceUrl).href);

        } catch(error){
            console.log("Invalid CSS URL:", match[2], error.message);
        }
        
    }
    return resources;

}

module.exports = {
    scanText,
    normalizedUrl,
    enqueueUrl,
    saveJavaScript,
    discoverDomResources,
    discoverCSSResources
};





