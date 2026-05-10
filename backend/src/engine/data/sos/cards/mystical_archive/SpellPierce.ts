import { AbilityType, CardDefinition, EffectType, Restriction, TargetType } from '@shared/engine_types';

export const SpellPierce: CardDefinition = {
    name: "Spell Pierce",
    manaCost: "{U}",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Counter target noncreature spell unless its controller pays {2}.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Spell,
                restrictions: [Restriction.NonCreature],
                count: 1
            }],
            effects: [
                {
                    type: EffectType.CounterSpell,
                    taxAmount: "{2}"
                }
            ]
        }
    ],
    scryfall_id: "bc8f80e2-dd9d-4abc-b44c-fbef4d403e6f",
    image_url: "https://cards.scryfall.io/normal/front/b/c/bc8f80e2-dd9d-4abc-b44c-fbef4d403e6f.jpg?1775936529",
    rarity: "uncommon"
};

