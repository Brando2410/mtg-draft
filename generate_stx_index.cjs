const fs = require('fs');
const path = require('path');

const stxCardsDir = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\cards';
const m21CardsDir = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\m21\\cards';
const outputFile = 'c:\\Users\\Brando\\Desktop\\keyday3\\mtg draft\\backend\\src\\engine\\data\\stx\\index.ts';

const files = fs.readdirSync(stxCardsDir);
const m21Files = fs.readdirSync(m21CardsDir);

let imports = ["import { ImplementableCard, CardDefinition } from '@shared/engine_types';"];
let mappings = [];
let seenNames = new Set();
let externalImports = new Map(); // path -> Set of names

function findValidCardNames(content) {
    const names = [];
    const topNameMatch = content.match(/export const \w+: (?:CardDefinition|Record<string, ImplementableCard>) = \{\s*name:\s*['"]([^'"]+)['"]/);
    if (topNameMatch) names.push(topNameMatch[1]);
    
    // Check for Record style (used in some files)
    const recordMatch = content.match(/export const (\w+): Record<string, ImplementableCard> = \{/);
    if (recordMatch && names.length === 0) {
        // If it's a record, the names are keys
        const recordContent = content.substring(content.indexOf('{'));
        const keyMatch = recordContent.match(/^\s*['"]([^'"]+)['"]\s*:/gm);
        if (keyMatch) {
            keyMatch.forEach(k => {
                const n = k.match(/['"]([^'"]+)['"]/)[1];
                if (!names.includes(n)) names.push(n);
            });
        }
    }

    const facesStart = content.indexOf('faces: [');
    if (facesStart !== -1) {
        let bracketLevel = 0;
        let pos = facesStart + 7;
        let endPos = -1;
        for (let i = pos; i < content.length; i++) {
            if (content[i] === '[') bracketLevel++;
            else if (content[i] === ']') {
                bracketLevel--;
                if (bracketLevel === 0) { endPos = i; break; }
            }
        }
        if (endPos !== -1) {
            const facesContent = content.substring(pos, endPos);
            const faceNameRegex = /name:\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = faceNameRegex.exec(facesContent)) !== null) {
                const name = match[1];
                const index = match.index;
                const lookback = facesContent.substring(Math.max(0, index - 100), index);
                if (!lookback.includes('tokenBlueprint') && !lookback.includes('emblemBlueprint')) {
                    if (!names.includes(name)) names.push(name);
                }
            }
        }
    }
    
    if (names.length === 0) {
        const firstMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
        if (firstMatch) names.push(firstMatch[1]);
    }
    return names;
}

// 1. Process singular cards in STX
files.sort().forEach(file => {
  if (file === 'index.ts' || !file.endsWith('.ts') || file.startsWith('STX_')) return;

  const name = path.basename(file, '.ts');
  const content = fs.readFileSync(path.join(stxCardsDir, file), 'utf8');
  const cardNames = findValidCardNames(content);
  
  if (cardNames.length > 0) {
      imports.push(`import { ${name} } from './cards/${name}';`);
      cardNames.forEach(cardName => {
          if (!seenNames.has(cardName)) {
              mappings.push(`    '${cardName}': ${name},`);
              seenNames.add(cardName);
          }
      });
  }
});

// 2. Scan all Batch files to ensure no card is missing
const batches = files.filter(f => f.startsWith('STX_') && f.endsWith('.ts'));
batches.forEach(batch => {
    const content = fs.readFileSync(path.join(stxCardsDir, batch), 'utf8');
    const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = nameRegex.exec(content)) !== null) {
        const cardName = match[1];
        if (['Pest', 'Spirit', 'Inkling', 'Elemental', 'Treasure', 'Fractal', 'Drake', 'Beast', 'Blood Avatar'].includes(cardName)) continue;
        if (cardName.includes("'s Emblem")) continue;

        if (!seenNames.has(cardName)) {
            // Missing singular file in STX? Check M21
            const safeName = cardName.replace(/[^a-zA-Z0-9]/g, '');
            const m21File = m21Files.find(f => f.toLowerCase() === `${safeName.toLowerCase()}.ts`);
            
            if (m21File) {
                const m21ImportName = path.basename(m21File, '.ts');
                const m21Path = `../m21/cards/${m21ImportName}`;
                if (!externalImports.has(m21Path)) externalImports.set(m21Path, new Set());
                externalImports.get(m21Path).add(m21ImportName);
                
                // M21 cards are exported as Record<string, ImplementableCard>
                // So we need to access the property
                mappings.push(`    '${cardName}': ${m21ImportName}['${cardName}'],`);
                seenNames.add(cardName);
            } else {
                console.log(`WARNING: Card "${cardName}" in ${batch} has no singular file in STX or M21.`);
            }
        }
    }
});

// Add external imports
for (const [path, names] of externalImports.entries()) {
    imports.push(`import { ${Array.from(names).join(', ')} } from '${path}';`);
}

const fileContent = `${imports.sort().join('\n')}

export const stx: Record<string, ImplementableCard> = {
${mappings.sort().join('\n')}
};
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Generated ${outputFile} with ${mappings.length} unique card mappings.`);
console.log(`Included ${externalImports.size} external imports from M21.`);
