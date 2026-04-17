import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const HallMonitor: CardDefinition = {
    name: 'Hall Monitor',
    manaCost: '{R}',
    scryfall_id: "02fdc551-0b22-49f4-8765-143ad82f16a3",
    image_url: "https://cards.scryfall.io/normal/front/0/2/02fdc551-0b22-49f4-8765-143ad82f16a3.jpg?1624591927",
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Lizard', 'Wizard'],
    power: "1",
    toughness: "1",
    keywords: ['Haste'],
    oracleText: 'Haste\n{1}{R}, {T}: Target creature can\'t block this turn.',
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}{R}' }, { type: CostType.Tap }],
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: { type: DurationType.UntilEndOfTurn }, cannotBlock: true }]
        }
    ]
};
