import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const EnthusiasticStudy: CardDefinition = {
    name: 'Enthusiastic Study',
    manaCost: '{1}{R}',

    colors: ['R'],
    types: ['Instant'],
    oracleText: "Target creature gets +3/+1 and gains trample until end of turn. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 3,
                    toughnessModifier: 1,
                    abilitiesToAdd: ['Trample'],
                    targetMapping: TargetMapping.Target1
                },
                { type: EffectType.Learn }
            ]
        }
    ],
    scryfall_id: "543c64ff-2c51-4a63-a940-dc8645717c85",
    image_url: "https://cards.scryfall.io/normal/front/5/4/543c64ff-2c51-4a63-a940-dc8645717c85.jpg?1624591748",
    rarity: "common"
};

