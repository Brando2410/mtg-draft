const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const typeMap = {
    // Types
    'Land': 'Type', 'Creature': 'Type', 'Artifact': 'Type', 'Enchantment': 'Type', 'Planeswalker': 'Type',
    'Instant': 'Type', 'Sorcery': 'Type', 'Permanent': 'Type', 'Nonland': 'Type', 'Noncreature': 'Type',
    'NonlandPermanent': 'Type', 'Token': 'Type', 'NonToken': 'Type', 'Legendary': 'Type', 'NonLegendary': 'Type',
    'ArtifactCreature': 'Type', 'Basic': 'Type', 'Nonbasic': 'Type',
    
    // Control / Ownership
    'OpponentControl': 'Control', 'YouControl': 'Control', 'Yours': 'Control', 'Opponents': 'Control',
    'OpponentControls': 'Control', 'YouOwn': 'Control', 'OpponentOwns': 'Control', 'You': 'Control',
    'Opponent': 'Control',
    
    // State
    'Tapped': 'State', 'Untapped': 'State', 'Attacking': 'State', 'Blocking': 'State', 'AttackingOrBlocking': 'State',
    
    // Identity
    'Self': 'Identity', 'Other': 'Identity', 'Another': 'Identity',
    
    // Zone
    'Graveyard': 'Zone', 'Hand': 'Zone', 'Library': 'Zone'
};

const dataDir = 'c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/data';

walkDir(dataDir, (filePath) => {
    if (!filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex to find restrictions: [ 'String' ] or restrictions: [ 'String1', 'String2' ]
    // This is a naive regex but should work for most of our card definitions.
    // We look for restrictions: [ followed by strings and commas until ]
    const restrictionsRegex = /restrictions:\s*\[([^\]]+)\]/g;

    content = content.replace(restrictionsRegex, (match, inner) => {
        // Split by comma, preserving quotes
        const parts = inner.split(',').map(p => p.trim());
        const newParts = parts.map(part => {
            // Check if it's a quoted string
            const stringMatch = part.match(/^['"]([^'"]+)['"]$/);
            if (stringMatch) {
                const val = stringMatch[1];
                const type = typeMap[val] || 'Type';
                changed = true;
                return `{ type: '${type}', value: '${val}' }`;
            }
            return part; // Leave objects or other things alone
        });

        if (changed) {
            return `restrictions: [\n                ${newParts.join(',\n                ')}\n            ]`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
});
