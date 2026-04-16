const fs = require('fs');
const path = require('path');

const cardsDir = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\sos\\cards';
const conditionProcessorPath = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\modules\\core\\ConditionProcessor.ts';

const conditionProcessorContent = fs.readFileSync(conditionProcessorPath, 'utf8');

const files = fs.readdirSync(cardsDir);
const conditions = new Set();

files.forEach(file => {
    if (!file.endsWith('.ts')) return;
    const content = fs.readFileSync(path.join(cardsDir, file), 'utf8');
    const matches = content.match(/condition:\s*['"](.*?)['"]/g);
    if (matches) {
        matches.forEach(m => {
            const cond = m.match(/condition:\s*['"](.*?)['"]/)[1];
            // Split by && and handle complex ones
            cond.split('&&').forEach(c => {
                const trimmed = c.trim().replace(/^\!/, '');
                if (trimmed.includes(':')) {
                    conditions.add(trimmed.split(':')[0]);
                } else if (trimmed.includes('||')) {
                   // Ignore complex parens for now, just look at the individual words
                   trimmed.match(/[A-Z0-9_]+/g)?.forEach(w => conditions.add(w));
                } else {
                    conditions.add(trimmed);
                }
            });
        });
    }
});

console.log("Found conditions in cards:");
const sorted = Array.from(conditions).sort();
sorted.forEach(c => {
    const isSupported = conditionProcessorContent.includes(`case '${c}'`) || 
                        conditionProcessorContent.includes(`case "${c}"`) ||
                        conditionProcessorContent.includes(`case '${c.toUpperCase()}'`) ||
                        conditionProcessorContent.includes(`case "${c.toUpperCase()}"`);
    
    if (!isSupported && c && !c.includes('(')) {
        console.log(`[UNSUPPORTED] ${c}`);
    } else if (c && !c.includes('(')) {
        console.log(`[SUPPORTED] ${c}`);
    }
});
