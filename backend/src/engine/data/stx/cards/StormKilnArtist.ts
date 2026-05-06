import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const StormKilnArtist: CardDefinition = {
    name: 'Storm-Kiln Artist',
    manaCost: '{3}{R}',
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Dwarf', 'Shaman'],
    power: '2',
    toughness: '2',
    oracleText: "Storm-Kiln Artist gets +1/+0 for each artifact you control.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    powerModifier: 'COUNT_MATCHING:Artifact,YouControl',
                    layer: 7
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Treasure',
                        types: ['Artifact', 'Token'],
                        subtypes: ['Treasure'],
                        oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                id: "{T}, Sacrifice this token: Add one mana of any color.",
                                isManaAbility: true,
                                costs: [{ type: CostType.Tap }, { type: CostType.SacrificeSelf }],
                                effects: [{ type: EffectType.AddMana, manaType: 'ANY' }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};


