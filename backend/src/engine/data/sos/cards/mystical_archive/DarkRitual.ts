import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const DarkRitual: CardDefinition = {
    name: "Dark Ritual",
    manaCost: "{B}",
    oracleText: "Add {B}{B}{B}.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: "{B}{B}{B}"
                }
            ]
        }
    ],
    set: "soa",
    scryfall_id: "95f27eeb-6f14-4db3-adb9-9be5ed76b34b",
    image_url: "https://cards.scryfall.io/normal/front/9/5/95f27eeb-6f14-4db3-adb9-9be5ed76b34b.jpg?1753711947",
    rarity: "common"
};

