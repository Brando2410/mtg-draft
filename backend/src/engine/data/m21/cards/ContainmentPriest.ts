import { AbilityType, CardDefinition } from "@shared/engine_types";

export const ContainmentPriest: CardDefinition = {
    name: "Containment Priest",
    manaCost: "{1}{W}",

    oracleText: "Flash\nIf a nontoken creature would enter the battlefield and it wasn’t cast, exile it instead.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "2",
    keywords: ["Flash"],
    abilities: [
        {
            type: AbilityType.Replacement,
            oracleText: "If a nontoken creature would enter the battlefield and it wasn't cast, exile it instead."
        }
    ],
    scryfall_id: "a24e8dba-5c86-4e32-8a52-61402f7fe9f0",
    image_url: "https://cards.scryfall.io/normal/front/a/2/a24e8dba-5c86-4e32-8a52-61402f7fe9f0.jpg?1594734854",
    rarity: "rare"
};

