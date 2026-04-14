const fs = require('fs');
const path = require('path');

const cardsDir = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\cards';
const indexPath = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\index.ts';

const files = fs.readdirSync(cardsDir);
const batches = files.filter(f => f.startsWith('STX_') && f.endsWith('.ts'));

const indexContent = fs.readFileSync(indexPath, 'utf8');
const singularFiles = files.filter(f => !f.startsWith('STX_') && f !== 'index.ts');

console.log(`Checking ${batches.length} batch files...`);

let missingInIndex = [];
let missingSingularFile = [];

batches.forEach(batch => {
    const content = fs.readFileSync(path.join(cardsDir, batch), 'utf8');
    // Extract names from CardDefinition objects in the array
    const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = nameRegex.exec(content)) !== null) {
        const cardName = match[1];
        // Skip common tokens
        if (['Pest', 'Spirit', 'Inkling', 'Elemental', 'Treasure', 'Fractal', 'Drake', 'Beast', 'Blood Avatar'].includes(cardName)) continue;
        if (cardName.includes("'s Emblem")) continue;

        // Check if in index
        if (!indexContent.includes(`'${cardName}':`)) {
            missingInIndex.push({ cardName, batch });
        }
        
        // Check if singular file exists (safe name)
        const safeName = cardName.replace(/[^a-zA-Z0-0]/g, '');
        const filename = `${safeName}.ts`;
        if (!fs.existsSync(path.join(cardsDir, filename))) {
            missingSingularFile.push({ cardName, filename, batch });
        }
    }
});

if (missingInIndex.length === 0 && missingSingularFile.length === 0) {
    console.log("SUCCESS: All cards from batches are in index.ts and have singular files.");
} else {
    if (missingInIndex.length > 0) {
        console.log("\nMUCH IMPORTANT: Missing from index.ts:");
        missingInIndex.forEach(m => console.log(` - "${m.cardName}" (in ${m.batch})`));
    }
    if (missingSingularFile.length > 0) {
        console.log("\nMUCH IMPORTANT: Missing singular file:");
        missingSingularFile.forEach(m => console.log(` - "${m.cardName}" -> expected ${m.filename} (in ${m.batch})`));
    }
}
