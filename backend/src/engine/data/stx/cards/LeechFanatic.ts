import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const LeechFanatic: CardDefinition = {
    name: 'Leech Fanatic',
    manaCost: '{1}{B}',
    scryfall_id: "307f9fe7-241b-4eb6-a059-be5384b4a1b6",
    image_url: "https://cards.scryfall.io/normal/front/3/0/307f9fe7-241b-4eb6-a059-be5384b4a1b6.jpg?1624591070",
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: "2",
    toughness: "2",
    oracleText: 'Whenever Leech Fanatic attacks, you may pay 2 life. If you do, it gains lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'SelfAttacking',
            effects: [{
                type: EffectType.Choice,
                label: "Pay 2 life for lifelink?",
                optional: true,
                choices: [{
                    label: "Pay 2 Life",
                    costs: [{ type: CostType.PayLife, value: 2 }],
                    effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Lifelink'] }]
                }]
            }]
        }
    ]
};


