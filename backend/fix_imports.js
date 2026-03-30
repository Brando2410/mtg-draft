const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'engine', 'modules');

const fileToFolder = {
    'TurnProcessor': 'core',
    'PriorityProcessor': 'core',
    'CombatProcessor': 'combat',
    'DamageProcessor': 'combat',
    'ActionProcessor': 'actions',
    'ManaProcessor': 'magic',
    'CostProcessor': 'magic',
    'ValidationProcessor': 'state',
    'StateBasedActionsProcessor': 'state',
    'LayerProcessor': 'state',
    'EffectProcessor': 'effects',
    'TriggerProcessor': 'effects'
};

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (f.endsWith('.ts') && f !== 'index.ts') {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Replace internal module imports
            let newContent = content.replace(/from '\.\/(\w+)'/g, (match, p1) => {
                const folder = fileToFolder[p1];
                if (folder) {
                    updated = true;
                    return `from '../${folder}/${p1}'`;
                }
                return match;
            });

            if (updated) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed', fullPath);
            }
        }
    }
}
processDir(modulesDir);

// Now fix GameEngine.ts, StackResolver.ts, and sandbox tests
function fixExternal(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory() && f !== 'modules') {
            fixExternal(fullPath);
        } else if (f.endsWith('.ts') && fullPath.indexOf('modules') === -1) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // GameEngine.ts and StackResolver.ts import from `./modules/Processor`
            // They should just import from `./modules` or `./modules/xxx/Processor`
            // Let's replace import { XYZ } from './modules/XYZ' with import { XYZ } from './modules'
            // But if it's multiple lines or single line... actually, TS can just import from './modules' since we have index.ts.
            // But we have different paths depending on the file location. 
            // Better to regex: from '.*modules/(\w+)'
            let newContent = content.replace(/from '(\.\.?\/.*?(?:modules))\/(\w+)'/g, (match, p1, p2) => {
                const folder = fileToFolder[p2];
                if (folder) {
                    updated = true;
                    return `from '${p1}/${folder}/${p2}'`;
                }
                return match;
            });

            if (updated) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed external', fullPath);
            }
        }
    }
}
fixExternal(path.join(__dirname, 'src', 'engine'));
fixExternal(path.join(__dirname, 'src', 'scripts'));
