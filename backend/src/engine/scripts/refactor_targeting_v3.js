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

    // Aggressive word-based replacement for targeting properties
    content = content.replace(/\btargetDefinition\b/g, 'targetDefinitions');
    content = content.replace(/\bauraRestriction\b/g, 'auraRestrictions');

    if (content !== original) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
