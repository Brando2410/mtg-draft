import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SymmetrySage: CardDefinition = {
    name: 'Symmetry Sage',
    manaCost: '{U}',
    scryfall_id: "c2409aee-3a80-4533-80bc-9383624c285d",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c2409aee-3a80-4533-80bc-9383624c285d.jpg?1681159448",
    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "0",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\nMagecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerSet: 2
            }]
        }
    ]
};
