const fs = require('fs');

const MAX_LENGTH = 10;

const passwordPattern   = /VISUALPING\{[0-9a-fA-F]{16}\}/g;


/** 
 * Scan text for :
 * 1. Normal VISUALPING passwords
 * 2. Passwords encoded as character-code arrays
*/

function scanText(text, sourceUrl) {

    const directMatches = text.match(passwordPattern);

    if(directMatches) {
        for(const password of directMatches) {
            if(!passwords.has(password)) {
                console.log('\n==============')
                console.log('*** New Password Found **');
                console.log('Password:', foundPassword);
                console.log("Source: ", sourceUrl);
                 console.log('==============\n')
            }
        }
    }

    // -----------------
    // 2. Character-code arrays 
    // 
    // Example: 
    // [86, 73, 85, ... ]

    const arrayPattern = /\[((?:\s*\d+\s*,?)+)\]/g;

    let arrayMatch;

    while((arrayMatch = arrayPattern.exec(text)) !== null) {
        
        const numbers = arrayMatch[1].split(',').map(value => Number(value.trim())).filter(Number.isFinite);
        
        if(numbers.length < MAX_LENGTH) {
            continue;
        }

        const decoded = String.fromCharCode(...numbers);

        const decodedMatches = decoded.match(passwordPattern);

        if(decodedMatches) {
            for(const password of decodedMatches) {
                if(!passwords.has(password)) {
                    passwords.add(password);
                    console.log('\n==============')
                    console.log('**** DECODED PASSWORd FOUND *** ');
                    console.log('SOURCE: ',sourceUrl);
                    console.log('==============\n')
                }
            }
        }

        

}
}
