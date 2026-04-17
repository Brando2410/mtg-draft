const fs = require('fs');
const path = require('path');

const mapping = JSON.parse(fs.readFileSync('cards_mapping.json', 'utf8'));

function updateSet(setName) {
  const dir = path.join(__dirname, '..', 'backend', 'src', 'engine', 'data', setName, 'cards');
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} not found.`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract name - handle both " and '
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    if (!nameMatch) return;
    
    let cardName = nameMatch[1];
    
    let data = mapping[cardName];
    
    if (!data) {
      const foundEntry = Object.entries(mapping).find(([k, v]) => k.startsWith(cardName + " //"));
      if (foundEntry) {
        data = foundEntry[1];
      }
    }

    if (data && !content.includes('scryfall_id:')) {
      const idStr = `    scryfall_id: "${data.id}",\n    image_url: "${data.url}",`;
      
      // Inject after name or manaCost
      if (content.includes('manaCost:')) {
        content = content.replace(/(manaCost:\s*["'][^"']+["'],?)/, `$1\n${idStr}`);
      } else {
        content = content.replace(/(name:\s*["'][^"']+["'],?)/, `$1\n${idStr}`);
      }
      
      fs.writeFileSync(filePath, content);
      count++;
    }
  });

  console.log(`Updated ${count} cards in ${setName}`);
}

updateSet('sos');
updateSet('stx');
updateSet('m21');
