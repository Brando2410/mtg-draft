import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';

export const CagedZombie: CardDefinition = {
    name: "Caged Zombie",
    manaCost: "{2}{B}",

    oracleText: "{1}{B}, {T}: Each opponent loses 2 life. Activate only if a creature died this turn.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{B}' },
                { type: CostType.Tap }
            ],
            condition: 'CREATURE_DIED_THIS_TURN',
            effects: [{ type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachOpponent }]
        }
    ],
    scryfall_id: "f8067745-35b6-4abd-9ae9-712159a26c89",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8067745-35b6-4abd-9ae9-712159a26c89.jpg?1594736024",
    rarity: "common"
};

