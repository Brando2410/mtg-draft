import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Restriction } from '@shared/engine_types';
export const EssenceScatter: CardDefinition = {
    name: "Essence Scatter",
    manaCost: "{1}{U}",
    scryfall_id: "32840097-0531-4c43-b6a8-e76c17420b04",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/2/32840097-0531-4c43-b6a8-e76c17420b04.jpg?1775937236",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Counter target creature spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Spell,
                restrictions: [Restriction.Creature],
                count: 1
            }],
            effects: [
                {
                    type: EffectType.CounterSpell,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
