const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/data/m21/cards';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (!file.endsWith('.ts')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check for duplicate Zone in the first line import
    const lines = content.split('\n');
    if (lines[0].includes('import') && lines[0].includes('Zone')) {
        const match = lines[0].match(/\{(.*)\}/);
        if (match) {
            const imports = match[1].split(',').map(s => s.trim());
            const uniqueImports = [...new Set(imports)];
            if (imports.length !== uniqueImports.length) {
                console.log(`Fixing ${file}`);
                lines[0] = lines[0].replace(match[1], uniqueImports.join(', '));
                fs.writeFileSync(filePath, lines.join('\n'));
            }
        }
    }
});
