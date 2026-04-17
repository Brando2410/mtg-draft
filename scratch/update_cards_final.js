const fs = require('fs');
const path = require('path');

const mapping = JSON.parse(fs.readFileSync('cards_mapping.json', 'utf8'));

function updateSet(setName) {
  const dir = path.join(__dirname, '..', 'backend', 'src', 'engine', 'data', setName, 'cards');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has scryfall_id
    if (content.includes('scryfall_id:')) return;

    // Extract name
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    if (!nameMatch) return;
    
    let cardName = nameMatch[1];
    let data = mapping[cardName];
    
    if (!data) {
      // Try prefixing with A- for STX
      if (setName === 'stx') {
        data = mapping["A-" + cardName];
      }
      // Try suffix with // if not found
      if (!data) {
        const foundEntry = Object.entries(mapping).find(([k, v]) => k.startsWith(cardName + " //"));
        if (foundEntry) data = foundEntry[1];
      }
    }

    if (data) {
      const idStr = `    scryfall_id: "${data.id}",\n    image_url: "${data.url}",`;
      
      // Better regex for manaCost that handles empty string ""
      const manaCostRegex = /manaCost:\s*["'][^"']*["'],?/;
      if (content.match(manaCostRegex)) {
        content = content.replace(manaCostRegex, (match) => match + '\n' + idStr);
      } else {
        // Fallback to name
        const nameRegex = /name:\s*["'][^"']+["'],?/;
        content = content.replace(nameRegex, (match) => match + '\n' + idStr);
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
