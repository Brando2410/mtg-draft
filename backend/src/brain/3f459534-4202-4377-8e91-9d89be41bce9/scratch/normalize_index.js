const fs = require('fs');
const path = require('path');

const INDEX_FILE = 'C:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/data/sos/index.ts';

function normalizeIndex() {
    const content = fs.readFileSync(INDEX_FILE, 'utf8');
    
    // 1. Capture all imports
    const importRegex = /^import \{ ([^}]+) \} from '\.\/cards\/([^']+)';/gm;
    let match;
    const imports = new Map(); // VariableName -> FilePath
    while ((match = importRegex.exec(content)) !== null) {
        imports.set(match[1].trim(), match[2]);
    }

    // 2. We need the actual NAME of the card for each variable to make it the key.
    // This is hard without importing them. 
    // BUT! We can assume the full name key is ALREADY in the file for most cards.
    // If we see:
    // 'Full Name // Back': VarName,
    // 'Full Name': VarName,
    // 'Back': (VarName as any).preparedFace,
    // We want to keep ONLY the one with ' // ' if it exists, otherwise the single name.

    const lines = content.split('\n');
    const newEntries = new Map(); // Key -> VarName

    // Regex to match registry entries
    const entryRegex = /^\s*['"]([^'"]+)['"]:\s*([^,(\s]+)/;
    
    lines.forEach(line => {
        const m = line.match(entryRegex);
        if (m) {
            const key = m[1];
            const varName = m[2];
            
            // Logic: 
            // If the key has " // ", it's the canonical full name. Always keep it.
            // If we don't have a canonical name for this variable yet, store this one.
            if (key.includes(' // ')) {
                newEntries.set(varName, key);
            } else if (!newEntries.has(varName)) {
                newEntries.set(varName, key);
            }
        }
    });

    // Rebuild the file
    let newContent = `import { CardDefinition } from '@shared/engine_types';\n`;
    
    // Alphabetize imports
    const sortedImports = Array.from(imports.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    sortedImports.forEach(([varName, filePath]) => {
        newContent += `import { ${varName} } from './cards/${filePath}';\n`;
    });

    newContent += `\nexport const sos: Record<string, CardDefinition> = {\n`;
    
    // Alphabetize entries by key
    const sortedEntries = Array.from(newEntries.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    sortedEntries.forEach(([varName, key]) => {
        newContent += `    '${key}': ${varName},\n`;
    });
    
    newContent += `};\n`;

    fs.writeFileSync(INDEX_FILE, newContent);
    console.log('Normalized sos/index.ts to 1 entry per card.');
}

normalizeIndex();
