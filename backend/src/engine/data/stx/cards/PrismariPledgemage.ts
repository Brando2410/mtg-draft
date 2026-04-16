import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const PrismariPledgemage: CardDefinition = {
    name: 'Prismari Pledgemage',
    manaCost: '{U/R}{U/R}', // Scryfall: {U/R}{U/R}
    colors: ['U', 'R'],
    types: ['Creature'],
    subtypes: ['Orc', 'Shaman'],
    power: '3',
    toughness: '3',
    keywords: ['Defender'],
    oracleText: "Defender\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Pledgemage can attack this turn as though it didn't have defender.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToRemove: ['Defender'], targetMapping: TargetMapping.Self }]
        }
    ]
  };


