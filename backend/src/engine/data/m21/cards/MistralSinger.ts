import { CardDefinition } from '@shared/engine_types';

export const MistralSinger: CardDefinition = {
    name: "Mistral Singer",
    manaCost: "{2}{U}",

    oracleText: "Flying\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Siren", "Wizard"],
    power: "2",
    toughness: "2",
    keywords: ["Flying", "Prowess"],
    abilities: [],
    scryfall_id: "d961c441-b76b-4bd8-b510-a3e073207a1b",
    image_url: "https://cards.scryfall.io/normal/front/d/9/d961c441-b76b-4bd8-b510-a3e073207a1b.jpg?1594735588",
    rarity: "common"
};

