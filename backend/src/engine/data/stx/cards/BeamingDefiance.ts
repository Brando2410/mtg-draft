import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const BeamingDefiance: CardDefinition = {
    name: 'Beaming Defiance',
    manaCost: '{1}{W}',

    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Target creature you control gets +2/+2 and gains hexproof until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 2,
                toughnessModifier: 2,
                abilitiesToAdd: ['Hexproof']
            }]
        }
    ],
    scryfall_id: "7e22411c-11c1-4770-8491-7952dd406e01",
    image_url: "https://cards.scryfall.io/normal/front/7/e/7e22411c-11c1-4770-8491-7952dd406e01.jpg?1624589223",
    rarity: "common"
};

