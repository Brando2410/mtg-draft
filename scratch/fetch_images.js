
const cards = [
    "Brainstorm",
    "Ancestral Recall",
    "Lightning Bolt",
    "Regrowth",
    "Demonic Tutor",
    "Swords to Plowshares",
    "Careful Study",
    "Raise Dead",
    "Seething Song",
    "Rampant Growth",
    "Stream of Life",
    "Sign in Blood"
];

const fs = require('fs');
const { execSync } = require('child_process');

const results = {};

for (const card of cards) {
    console.log(`Fetching ${card}...`);
    try {
        const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card)}`;
        const output = execSync(`curl.exe -H "User-Agent: Antigravity/1.0" "${url}"`).toString();
        const json = JSON.parse(output);
        results[card] = json.image_uris.png;
    } catch (e) {
        console.error(`Failed ${card}: ${e.message}`);
    }
}

console.log(JSON.stringify(results, null, 2));
