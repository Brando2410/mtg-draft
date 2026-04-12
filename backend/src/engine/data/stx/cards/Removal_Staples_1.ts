import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const Fracture: ImplementableCard = {
    name: 'Fracture',
    manaCost: '{W}{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['white', 'black'],
    oracleText: "Destroy target artifact, enchantment, or planeswalker.",
    abilities: [
        {
            id: 'fracture_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: [{ type: 'AnyOf', values: ['Artifact', 'Enchantment', 'Planeswalker'] }]
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: 'TARGET_1'
                }
            ]
        }
    ]
};

export const VanishingVerse: ImplementableCard = {
    name: 'Vanishing Verse',
    manaCost: '{W}{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['white', 'black'],
    oracleText: "Exile target monocolored permanent.",
    abilities: [
        {
            id: 'vanishing_verse_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Monocolored', 'Permanent']
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: 'TARGET_1'
                }
            ]
        }
    ]
};

export const RipApart: ImplementableCard = {
    name: 'Rip Apart',
    manaCost: '{R}{W}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['red', 'white'],
    oracleText: "Choose one —\n• Rip Apart deals 3 damage to target creature or planeswalker.\n• Destroy target artifact or enchantment.",
    abilities: [
        {
            id: 'rip_apart_modal',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose Mode',
                    choices: [
                        {
                            label: '3 Damage',
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: 3,
                                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: [{ type: 'AnyOf', values: ['Creature', 'Planeswalker'] }] }
                                }
                            ]
                        },
                        {
                            label: 'Destroy Artifact/Enchantment',
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: [{ type: 'AnyOf', values: ['Artifact', 'Enchantment'] }] }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
