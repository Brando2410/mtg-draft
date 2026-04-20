import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const CagedZombie: CardDefinition = {
    name: "Caged Zombie",
    manaCost: "{2}{B}",
    scryfall_id: "1098656d-e435-4429-9e66-64197ec61858",
    image_url: "https://cards.scryfall.io/normal/front/1/0/1098656d-e435-4429-9e66-64197ec61858.jpg?1594736005",
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
    ]
};
