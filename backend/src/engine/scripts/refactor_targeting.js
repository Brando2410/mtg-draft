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

    // 1. Handle cases where targetDefinition is an array: rename to targetDefinitions
    // targetDefinition: [ ... ] -> targetDefinitions: [ ... ]
    content = content.replace(/targetDefinition:\s*\[/g, 'targetDefinitions: [');

    // 2. Handle cases where targetDefinition is an object: rename and wrap in array
    // targetDefinition: { ... } -> targetDefinitions: [{ ... }]
    // We need to be careful with nested braces. 
    // This regex looks for targetDefinition: { and finds the matching closing brace.
    
    let index = 0;
    while ((index = content.indexOf('targetDefinition:', index)) !== -1) {
        let startOfValue = content.indexOf('{', index);
        let endOfProperty = content.indexOf(',', index); // Rough check for end
        
        // If it's not an object (e.g. it's already an array or a variable), skip
        if (startOfValue === -1 || (endOfProperty !== -1 && endOfProperty < startOfValue)) {
            index += 1;
            continue;
        }

        // Find matching closing brace
        let openBraces = 0;
        let endOfValue = -1;
        for (let i = startOfValue; i < content.length; i++) {
            if (content[i] === '{') openBraces++;
            if (content[i] === '}') openBraces--;
            if (openBraces === 0) {
                endOfValue = i;
                break;
            }
        }

        if (endOfValue !== -1) {
            let value = content.substring(startOfValue, endOfValue + 1);
            let before = content.substring(0, index);
            let after = content.substring(endOfValue + 1);
            content = before + 'targetDefinitions: [' + value + ']' + after;
            index = index + 'targetDefinitions: ['.length + value.length + 1;
        } else {
            index += 1;
        }
    }

    if (content !== original) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
