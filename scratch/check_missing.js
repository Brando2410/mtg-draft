const fs = require('fs');
const path = require('path');

function checkSet(setName) {
  const dir = path.join(__dirname, '..', 'backend', 'src', 'engine', 'data', setName, 'cards');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  const missing = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!content.includes('scryfall_id:')) {
      const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
      missing.push({ file, name: nameMatch ? nameMatch[1] : 'UNKNOWN' });
    }
  });

  console.log(`Missing in ${setName}: ${missing.length}`);
  missing.slice(0, 10).forEach(m => console.log(` - ${m.name} (${m.file})`));
}

checkSet('sos');
checkSet('stx');
checkSet('m21');
