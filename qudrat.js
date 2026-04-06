// faylni ishlatish kodi 
// node combine.js

const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'Barcha_kodlar.txt');
let result = '';

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            traverse(p);
        } else {
            result += `\n\n=========================================\nFILE: ${p}\n=========================================\n`;
            result += fs.readFileSync(p, 'utf8');
        }
    }
}

try {
    traverse('src');
    fs.writeFileSync(outPath, result);
    console.log(`Success! All files written to ${outPath}`);
} catch (error) {
    console.error('Error combining files:', error);
}
