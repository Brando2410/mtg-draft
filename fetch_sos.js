const fs = require('fs');
const https = require('https');
const path = require('path');

const setCode = 'sos';
const query = `set:${setCode} game:paper`;
const baseUrl = 'https://api.scryfall.com/cards/search?q=';

async function fetchCards(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity/1.0',
                'Accept': 'application/json'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.object === 'error') {
                        console.error('Scryfall Error:', json.details);
                        resolve(null);
                    } else {
                        resolve(json);
                    }
                } catch (e) {
                    console.error('JSON Parse Error:', e.message);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function escapeKey(name) {
    return name.replace(/'/g, "\\'");
}

async function main() {
    let url = baseUrl + encodeURIComponent(query);
    let allCards = [];
    
    try {
        while (url) {
            console.log(`Fetching ${url}...`);
            const result = await fetchCards(url);
            if (!result) break;
            
            allCards.push(...result.data);
            url = result.has_more ? result.next_page : null;
        }
        
        if (allCards.length === 0) {
            console.log("No cards found.");
            return;
        }
        
        console.log(`Found ${allCards.length} cards.`);
        
        const sosDir = path.join(__dirname, 'backend', 'src', 'engine', 'data', 'sos');
        const cardsDir = path.join(sosDir, 'cards');
        
        if (!fs.existsSync(sosDir)) fs.mkdirSync(sosDir, { recursive: true });
        if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });
        
        let importLines = [];
        let mappingLines = [];
        let seenMappings = new Set();
        
        for (const card of allCards) {
            const safeName = card.name.replace(/[^a-zA-Z0-9]/g, '');
            const filename = `${safeName}.ts`;
            
            const metadata = {
                name: card.name,
                manaCost: card.mana_cost || '',
                colors: card.colors || [],
                types: card.type_line ? card.type_line.split(' // ')[0].split(' — ')[0].split(' ') : [],
                subtypes: card.type_line && card.type_line.split(' // ')[0].includes(' — ') ? card.type_line.split(' // ')[0].split(' — ')[1].split(' ') : [],
                oracleText: card.oracle_text || '',
                abilities: []
            };
            
            metadata.types = metadata.types.filter(t => t);
            metadata.subtypes = metadata.subtypes.filter(s => s);

            if (card.power) metadata.power = card.power;
            if (card.toughness) metadata.toughness = card.toughness;
            if (card.loyalty) metadata.loyalty = card.loyalty;

            if (card.card_faces) {
                metadata.faces = card.card_faces.map(face => ({
                    name: face.name,
                    manaCost: face.mana_cost || '',
                    colors: face.colors || [],
                    types: face.type_line ? face.type_line.split(' — ')[0].split(' ') : [],
                    subtypes: face.type_line && face.type_line.includes(' — ') ? face.type_line.split(' — ')[1].split(' ') : [],
                    oracleText: face.oracle_text || '',
                    power: face.power,
                    toughness: face.toughness,
                    loyalty: face.loyalty
                }));
            }

            const fileContent = `import { CardDefinition } from '@shared/engine_types';

export const ${safeName}: CardDefinition = ${JSON.stringify(metadata, null, 4)};
`;
            
            fs.writeFileSync(path.join(cardsDir, filename), fileContent);
            
            importLines.push(`import { ${safeName} } from './cards/${safeName}';`);
            
            if (!seenMappings.has(card.name)) {
                mappingLines.push(`    '${escapeKey(card.name)}': ${safeName},`);
                seenMappings.add(card.name);
            }
            if (metadata.faces) {
                metadata.faces.forEach(face => {
                    if (face.name !== card.name && !seenMappings.has(face.name)) {
                        mappingLines.push(`    '${escapeKey(face.name)}': ${safeName},`);
                        seenMappings.add(face.name);
                    }
                });
            }
        }
        
        const indexContent = `import { ImplementableCard } from '@shared/engine_types';
${importLines.sort().join('\n')}

export const sos: Record<string, ImplementableCard> = {
${mappingLines.sort().join('\n')}
};
`;
        
        fs.writeFileSync(path.join(sosDir, 'index.ts'), indexContent);
        console.log(`Generated SOS set with ${allCards.length} cards.`);
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

main();
