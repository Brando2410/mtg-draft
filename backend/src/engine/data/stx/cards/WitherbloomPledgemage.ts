import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WitherbloomPledgemage: CardDefinition = {
    name: 'Witherbloom Pledgemage',
    manaCost: '{2}{B/G}{B/G}',
    colors: ['B', 'G'],
    types: ['Creature'],
    subtypes: ['Treefolk', 'Druid'],
    power: '4',
    toughness: '3',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Witherbloom Pledgemage gets +1/+0 and gains first strike until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 1,
                    abilitiesToAdd: ['First strike'],
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "a6cc6914-2dcb-411d-90a5-01853ff2d5b8",
    image_url: "https://cards.scryfall.io/normal/front/a/6/a6cc6914-2dcb-411d-90a5-01853ff2d5b8.jpg?1771242005",
    rarity: "common"
};

