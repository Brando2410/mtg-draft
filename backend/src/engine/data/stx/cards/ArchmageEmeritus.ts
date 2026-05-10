import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ArchmageEmeritus: CardDefinition = {
    name: 'Archmage Emeritus',
    manaCost: '{2}{U}{U}',

    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.DrawCards,
                    targetMapping: TargetMapping.Controller,
                    amount: 1
                }
            ]
        }
    ],
    scryfall_id: "dd547601-d650-4a02-a3a4-890bcef03a7c",
    image_url: "https://cards.scryfall.io/normal/front/d/d/dd547601-d650-4a02-a3a4-890bcef03a7c.jpg?1775940916",
    rarity: "rare"
};

