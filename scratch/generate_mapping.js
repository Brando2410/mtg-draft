const fs = require('fs');

function processSet(filename) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const mapping = {};
  data.data.forEach(card => {
    let name = card.name;
    // For double faced cards, we usually use the full name "Front // Back" or just "Front"
    // Scryfall provides the name.
    
    mapping[name] = {
      id: card.id,
      url: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal
    };
  });
  return mapping;
}

const sos = processSet('sos_cards.json');
const stx = processSet('stx_cards.json');
const m21 = processSet('m21_cards.json');

const fullMapping = { ...sos, ...stx, ...m21 };

fs.writeFileSync('cards_mapping.json', JSON.stringify(fullMapping, null, 2));
console.log('Mapping generated!');
