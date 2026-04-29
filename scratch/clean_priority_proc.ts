import * as fs from 'fs';
const path = 'backend/src/engine/modules/core/turn/PriorityProcessor.ts';
let content = fs.readFileSync(path, 'utf8');

// The block to remove (graveyard, exile, library scans that are now redundant)
const redundantBlockRegex = /\/\/ 2\. Check Graveyard[\s\S]*?if \(this\.canObjectBePlayed\(state, playerId, topCard\.id, false\)\) \{\s*return true;\s*\}\s*\}/;

content = content.replace(redundantBlockRegex, "");

fs.writeFileSync(path, content);
console.log("Cleaned up PriorityProcessor.ts");
