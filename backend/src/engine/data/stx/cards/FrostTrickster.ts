import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const FrostTrickster: CardDefinition = {
    name: 'Frost Trickster',
    manaCost: '{2}{U}',
    scryfall_id: "fd79c9cc-0a8c-4d88-96e2-cb177134a18d",
    image_url: "https://cards.scryfall.io/normal/front/f/d/fd79c9cc-0a8c-4d88-96e2-cb177134a18d.jpg?1624590148",
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
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.OpponentControl]
            }],
            effects: [
                { type: EffectType.Tap, targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, effects: [{ type: 'Freeze' }], duration: { type: DurationType.UntilNextUntapStep }, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};
