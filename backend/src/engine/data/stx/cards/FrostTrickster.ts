import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, DurationType } from '@shared/engine_types';

export const FrostTrickster: CardDefinition = {
    name: 'Frost Trickster',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Bird', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Frost Trickster enters the battlefield, tap target creature an opponent controls. It doesn\'t untap during its controller\'s next untap step.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature,
                restrictions: ['opponentcontrol']
            },
            effects: [
                { type: EffectType.Tap, targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, effects: [{ type: 'Freeze' }], duration: { type: DurationType.UntilNextUntapStep }, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};
