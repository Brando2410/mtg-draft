import { AbilityType, CardDefinition, DurationType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ExponentialGrowth: CardDefinition = {
    name: "Exponential Growth",
    manaCost: "{X}{X}{R}{G}",

    colors: ['R', 'G'],
    types: ["Sorcery"],
    oracleText: "Until end of turn, double target creature's power X times.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                // The engine would need a custom handler for 2^X
                effects: [{ type: 'DoublePowerXTimes', amount: DynamicAmount.X }],
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "7c129bb7-9489-44bd-a46d-c5f738bf9d25",
    image_url: "https://cards.scryfall.io/normal/front/7/c/7c129bb7-9489-44bd-a46d-c5f738bf9d25.jpg?1624592712",
    rarity: "rare"
};

