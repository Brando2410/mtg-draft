import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const WitherbloomPledgemage: ImplementableCard = {
    name: 'Witherbloom Pledgemage',
    manaCost: '{3}{BG}{BG}',
    type_line: 'Creature — Treefolk Warlock',
    types: ['Creature'],
    subtypes: ['Treefolk', 'Warlock'],
    power: '5',
    toughness: '5',
    keywords: [],
    colors: ['black', 'green'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, you gain 1 life.',
    abilities: [
        {
            id: 'witherbloom_pledgemage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
