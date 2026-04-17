import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EagerFirstYear: CardDefinition = {
    name: 'Eager First-Year',
    manaCost: '{1}{W}',
    scryfall_id: "7a83543b-3b6f-4e28-96f9-007b814bcfd6",
    image_url: "https://cards.scryfall.io/normal/front/7/a/7a83543b-3b6f-4e28-96f9-007b814bcfd6.jpg?1624589409",
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "2",
    toughness: "2",
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Eager First-Year gets +1/+0 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', powerModifier: 1 }]
        }
    ]
  };


