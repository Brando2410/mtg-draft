const fs = require('fs');
const path = require('path');

const sosDir = 'c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/data/sos/cards';

const files = fs.readdirSync(sosDir);

for (const file of files) {
    const filePath = path.join(sosDir, file);
    if (!fs.lstatSync(filePath).isFile()) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Simple Case: { type: 'Type', value: '...' }
    const simpleRegex = /\{\s*type:\s*['"]Type['"],\s*value:\s*['"](\w+)['"]\s*\}/g;
    if (simpleRegex.test(content)) {
        content = content.replace(simpleRegex, "'$1'");
        modified = true;
    }

    // 2. OR Case: { type: 'Type', value: 'Artifact' }, { type: 'Type', value: 'Creature', isOr: true }
    // This is more complex to catch as a single regex if they vary in formatting.
    // Let's do a more generic multi-line catch for specific pairs.
    
    // Artifact OR Creature -> ArtifactOrCreature
    const orRegex1 = /\{\s*type:\s*['"]Type['"],\s*value:\s*['"]Artifact['"]\s*\},\s*\{\s*type:\s*['"]Type['"],\s*value:\s*['"]Creature['"],\s*isOr:\s*true\s*\}/g;
    if (orRegex1.test(content)) {
        content = content.replace(orRegex1, "'ArtifactOrCreature'");
        modified = true;
    }

    // Creature OR Planeswalker
    const orRegex2 = /\{\s*type:\s*['"]Type['"],\s*value:\s*['"]Creature['"]\s*\},\s*\{\s*type:\s*['"]Type['"],\s*value:\s*['"]Planeswalker['"],\s*isOr:\s*true\s*\}/g;
    if (orRegex2.test(content)) {
        content = content.replace(orRegex2, "'CreatureOrPlaneswalker'");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned up restrictions object in ${file}`);
    }
}
console.log('Finished cleaning up restriction objects.');
