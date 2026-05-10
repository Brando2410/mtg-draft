import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Counterspell: CardDefinition = {
    name: "Counterspell",
    manaCost: "{U}{U}",
    oracleText: "Counter target spell.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Spell,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.CounterSpell,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "4f616706-ec97-4923-bb1e-11a69fbaa1f8",
    image_url: "https://cards.scryfall.io/normal/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1751282477",
    rarity: "uncommon"
};

