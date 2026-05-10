import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const EssenceInfusion: CardDefinition = {
    name: 'Essence Infusion',
    manaCost: '{1}{B}',

    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Put two +1/+1 counters on target creature. It gains lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ count: 1, type: TargetType.Creature }],
            effects: [
                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 2, targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Lifelink'] }
            ]
        }
    ],
    scryfall_id: "71a48d0c-1e5b-43f2-8974-e2e5bb06310d",
    image_url: "https://cards.scryfall.io/normal/front/7/1/71a48d0c-1e5b-43f2-8974-e2e5bb06310d.jpg?1624590892",
    rarity: "common"
};

