import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WitherbloomPledgemage: CardDefinition = {
    name: 'Witherbloom Pledgemage',
    manaCost: '{2}{B/G}{B/G}', // Scryfall: {2}{B/G}{B/G}
    colors: ['B', 'G'],
    types: ['Creature'],
    subtypes: ['Treefolk', 'Druid'],
    power: '4', // Scryfall: 4/3
    toughness: '3',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Witherbloom Pledgemage gets +1/+0 and gains first strike until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    abilitiesToAdd: ['First strike'],
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
  };


