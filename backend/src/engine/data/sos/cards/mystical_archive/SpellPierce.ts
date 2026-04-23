import { AbilityType, CardDefinition, EffectType, TargetType, Restriction } from '@shared/engine_types';

export const SpellPierce: CardDefinition = {
    name: "Spell Pierce",
    manaCost: "{U}",
    scryfall_id: "bc8f80e2-dd9d-4abc-b44c-fbef4d403e6f",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/c/bc8f80e2-dd9d-4abc-b44c-fbef4d403e6f.jpg?1775936529",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Counter target noncreature spell unless its controller pays {2}.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Spell,
                restrictions: [Restriction.NonCreature],
                count: 1
            },
            effects: [
                {
                    type: EffectType.CounterSpell,
                    tax: "{2}"
                }
            ]
        }
    ]
};
