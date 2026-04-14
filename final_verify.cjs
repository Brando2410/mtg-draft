const fs = require('fs');
const path = require('path');

const stxCardsDir = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\cards';
const indexPath = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\index.ts';

const files = fs.readdirSync(stxCardsDir);
const batches = files.filter(f => f.startsWith('STX_') && f.endsWith('.ts'));

const indexContent = fs.readFileSync(indexPath, 'utf8');

console.log(`Checking ${batches.length} batch files...`);

let missingNames = [];

batches.forEach(batch => {
    const content = fs.readFileSync(path.join(stxCardsDir, batch), 'utf8');
    const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = nameRegex.exec(content)) !== null) {
        const cardName = match[1];
        if (['Pest', 'Spirit', 'Inkling', 'Elemental', 'Treasure', 'Fractal', 'Drake', 'Beast', 'Blood Avatar'].includes(cardName)) continue;
        if (cardName.includes("'s Emblem")) continue;

        // Check if cardName is a key in the stx object
        // The mapping looks like: 'Card Name': Identifier, or 'Card Name': Identifier['Card Name'],
        const escapedName = cardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const keyRegex = new RegExp(`['"]${escapedName}['"]\\s*:`, 'g');
        
        if (!keyRegex.test(indexContent)) {
            missingNames.push({ cardName, batch });
        }
    }
});

if (missingNames.length === 0) {
    console.log("SUCCESS: All cards from batches are correctly exported in index.ts.");
} else {
    console.log(`\nMISSING FROM EXPORTS (${missingNames.length}):`);
    missingNames.forEach(m => console.log(` - "${m.cardName}" (in ${m.batch})`));
}
