import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, DurationType } from '@shared/engine_types';

export const LoreholdPledgemage: CardDefinition = {
    name: 'Lorehold Pledgemage',
    manaCost: '{1}{R/W}{R/W}',
    scryfall_id: "79b88b38-6b5a-4a89-80ca-add79c11e8b9",
    image_url: "https://cards.scryfall.io/normal/front/7/9/79b88b38-6b5a-4a89-80ca-add79c11e8b9.jpg?1627429506", // Scryfall: {1}{R/W}{R/W}
    colors: ['R', 'W'],
    types: ['Creature'],
    subtypes: ['Rhino', 'Cleric'],
    power: '2',
    toughness: '2',
    keywords: ['First strike'],
    oracleText: 'First strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Lorehold Pledgemage gets +1/+1 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: { type: DurationType.UntilEndOfTurn }, targetMapping: TargetMapping.Self }]
        }
    ]
};


