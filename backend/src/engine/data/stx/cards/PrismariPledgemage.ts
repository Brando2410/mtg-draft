import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PrismariPledgemage: CardDefinition = {
    name: 'Prismari Pledgemage',
    manaCost: '{U/R}{U/R}',
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
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToRemove: ['Defender'],
                targetMapping: TargetMapping.Self
            }]
        }
    ],
    scryfall_id: "404b4c7b-5d40-4ad1-bd40-3da1d08f5c78",
    image_url: "https://cards.scryfall.io/normal/front/4/0/404b4c7b-5d40-4ad1-bd40-3da1d08f5c78.jpg?1627429991",
    rarity: "common"
};

