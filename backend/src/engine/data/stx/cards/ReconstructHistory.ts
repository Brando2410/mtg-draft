import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ReconstructHistory: ImplementableCard = {
    name: 'Reconstruct History',
    manaCost: '{2}{W}{R}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['white', 'red'],
    supertypes: [],
    oracleText: 'Return up to one target artifact card, up to one target enchantment card, up to one target instant card, up to one target sorcery card, and up to one target planeswalker card from your graveyard to your hand. Exile Reconstruct History.',
    abilities: [
        {
            id: 'reconstruct_history_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 5,
                minCount: 0,
                optional: true,
                perTargetRestrictions: [
                    ['Artifact'],
                    ['Enchantment'],
                    ['Instant'],
                    ['Sorcery'],
                    ['Planeswalker']
                ]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: 'TARGET_ALL'
                }
            ],
            exileOnResolution: true
        }
    ]
};
