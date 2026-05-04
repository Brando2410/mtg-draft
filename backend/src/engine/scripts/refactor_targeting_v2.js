const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2] || '.';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

walk(projectRoot, (filePath) => {
    if (!filePath.endsWith('.ts') || filePath.includes('node_modules') || filePath.includes('.git')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace the word 'targetDefinition' with 'targetDefinitions' 
    // ONLY if it starts with lowercase 't' and isn't part of a larger word.
    // This avoids touching the Type name 'TargetDefinition'.
    
    // Pattern 1: targetDefinition: -> targetDefinitions:
    content = content.replace(/\btargetDefinition\s*:/g, 'targetDefinitions:');
    
    // Pattern 2: targetDefinition, -> targetDefinitions, (shorthand)
    content = content.replace(/\btargetDefinition\s*,/g, 'targetDefinitions,');

    // Pattern 3: targetDefinition) -> targetDefinitions) (end of arg list)
    content = content.replace(/\btargetDefinition\s*\)/g, 'targetDefinitions)');

    // Pattern 4: targetDefinition. -> targetDefinitions. (property access)
    content = content.replace(/\btargetDefinition\./g, 'targetDefinitions.');

    // Pattern 5: = targetDefinition -> = targetDefinitions (assignment)
    content = content.replace(/=\s*targetDefinition\b/g, '= targetDefinitions');
    
    // Pattern 6: parameter/variable usage in middle of code
    // e.g. TargetingProcessor.isLegalTarget(..., targetDefinition, ...)
    content = content.replace(/,\s*targetDefinition\s*,/g, ', targetDefinitions,');

    if (content !== original) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
