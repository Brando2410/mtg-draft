
const cards = [
    "Skycoach Conductor",
    "Emeritus of Ideation",
    "Tam, Observant Sequencer",
    "Spellbook Seeker",
    "Cheerful Osteomancer",
    "Blazing Firesinger",
    "Studious First-Year",
    "Infirmary Healer",
    "Scheming Silvertongue",
    "Emeritus of Conflict",
    "Emeritus of Abundance",
    "Emeritus of Truce",
    "Emeritus of Woe",
    "Abigale, Poet Laureate"
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
        if (json.image_uris) {
            results[card] = json.image_uris.png;
        } else if (json.card_faces) {
            results[card] = json.card_faces[0].image_uris.png;
            results[card + "_BACK"] = json.card_faces[1].image_uris.png;
        }
    } catch (e) {
        console.error(`Failed ${card}: ${e.message}`);
    }
}

console.log(JSON.stringify(results, null, 2));
