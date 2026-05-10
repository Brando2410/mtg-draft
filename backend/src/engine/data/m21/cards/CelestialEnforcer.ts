import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const CelestialEnforcer: CardDefinition = {
    name: "Celestial Enforcer",
    manaCost: "{2}{W}",

    oracleText: "{1}{W}, {T}: Tap target creature. Activate only if you control a creature with flying.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{W}' },
                { type: CostType.Tap }
            ],
            condition: 'HAS_CREATURE_WITH_FLYING_YOU_CONTROL',
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "46666fba-d4a7-4687-8747-a42e4c6d853e",
    image_url: "https://cards.scryfall.io/normal/front/4/6/46666fba-d4a7-4687-8747-a42e4c6d853e.jpg?1594734826",
    rarity: "common"
};

