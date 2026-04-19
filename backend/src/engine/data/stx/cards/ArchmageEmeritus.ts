import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ArchmageEmeritus: CardDefinition = {
    name: 'Archmage Emeritus',
    manaCost: '{2}{U}{U}',
    scryfall_id: "761df6cd-0928-4167-8902-58fdb50181a0",
    image_url: "https://cards.scryfall.io/normal/front/7/6/761df6cd-0928-4167-8902-58fdb50181a0.jpg?1624589970",
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
    ]
  };


