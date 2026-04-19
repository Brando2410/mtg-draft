import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CleverLumimancer: CardDefinition = {
    name: 'Clever Lumimancer',
    manaCost: '{W}',
    scryfall_id: "69957656-cfdf-4001-8e84-0ef29e4a468d",
    image_url: "https://cards.scryfall.io/normal/front/6/9/69957656-cfdf-4001-8e84-0ef29e4a468d.jpg?1624589246",
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '1',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Clever Lumimancer gets +2/+2 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 2,
                    toughnessModifier: 2
                }
            ]
        }
    ]
};


