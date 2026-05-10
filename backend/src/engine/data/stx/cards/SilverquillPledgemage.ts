import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SilverquillPledgemage: CardDefinition = {
    name: 'Silverquill Pledgemage',
    manaCost: '{1}{W/B}{W/B}',
    colors: ['W', 'B'],
    types: ['Creature'],
    subtypes: ['Vampire', 'Cleric'],
    power: '3',
    toughness: '1',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Silverquill Pledgemage gains flying or lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose an ability for Silverquill Pledgemage",
                    choices: [
                        { label: 'Flying', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Flying'], targetMapping: TargetMapping.Self }] },
                        { label: 'Lifelink', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Lifelink'], targetMapping: TargetMapping.Self }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "a3f64ad2-4041-421d-baa2-206cedcecf0e",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a3f64ad2-4041-421d-baa2-206cedcecf0e.jpg?1624740044",
    rarity: "common"
};

