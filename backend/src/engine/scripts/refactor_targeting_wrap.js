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

    const propertiesToWrap = ['targetDefinitions', 'auraRestrictions'];

    propertiesToWrap.forEach(prop => {
        let index = 0;
        while ((index = content.indexOf(prop + ':', index)) !== -1) {
            let startOfValue = content.indexOf('{', index);
            let endOfProperty = content.indexOf(',', index); 
            let endOfStatement = content.indexOf(';', index);
            let endOfObject = content.indexOf('}', index);

            // If it's already an array or not an object, skip
            if (startOfValue === -1 || (endOfProperty !== -1 && endOfProperty < startOfValue)) {
                index += 1;
                continue;
            }

            // Simple brace counter to find end of object
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
                // Check if it's already inside an array bracket (safety check)
                let beforeChar = content.substring(index + prop.length + 1).trim()[0];
                if (beforeChar !== '[') {
                    let before = content.substring(0, index + prop.length + 1);
                    let after = content.substring(endOfValue + 1);
                    content = before + ' [' + value + ']' + after;
                    index = index + prop.length + 1 + value.length + 5;
                } else {
                    index += 1;
                }
            } else {
                index += 1;
            }
        }
    });

    if (content !== original) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
