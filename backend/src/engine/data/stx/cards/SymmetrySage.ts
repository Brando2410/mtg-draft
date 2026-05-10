import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SymmetrySage: CardDefinition = {
    name: 'Symmetry Sage',
    manaCost: '{U}',

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
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerSet: 2
            }]
        }
    ],
    scryfall_id: "3e726fc7-36cf-405c-9b7c-d1e41cd6c68f",
    image_url: "https://cards.scryfall.io/normal/front/3/e/3e726fc7-36cf-405c-9b7c-d1e41cd6c68f.jpg?1624590486",
    rarity: "uncommon"
};

