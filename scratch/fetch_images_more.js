
const cards = [
    "Strife Scholar",
    "Awaken the Ages",
    "Vastlands Scavenger",
    "Bind to Life",
    "Sanar, Unfinished Genius",
    "Wild Idea",
    "Quill-Blade Laureate",
    "Twofold Intent",
    "Pigment Wrangler",
    "Striking Palette",
    "Maelstrom Artisan",
    "Rocket Volley",
    "Lluwen, Exchange Student",
    "Pest Friend",
    "Landscape Painter",
    "Vibrant Idea",
    "Jadzi, Steward of Fate",
    "Oracle's Gift",
    "Honorbound Page",
    "Forum's Favor",
    "Goblin Glasswright",
    "Craft with Pride",
    "Elite Interceptor",
    "Rejoinder",
    "Campus Composer",
    "Aqueous Aria"
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
