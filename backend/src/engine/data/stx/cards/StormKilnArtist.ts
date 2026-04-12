import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const StormKilnArtist: ImplementableCard = {
    name: 'Storm-Kiln Artist',
    manaCost: '{3}{R}',
    type_line: 'Creature — Dwarf Shaman',
    types: ['Creature'],
    subtypes: ['Dwarf', 'Shaman'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['red'],
    supertypes: [],
    oracleText: 'Storm-Kiln Artist gets +1/+0 for each artifact you control.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.',
    abilities: [
        {
            id: 'storm_kiln_artist_static',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    powerModifier: (state: any, source: any) => {
                        return state.battlefield.filter((o: any) => 
                            o.controllerId === source.controllerId && 
                            o.definition.types.some((t: string) => t.toLowerCase() === 'artifact')
                        ).length;
                    }
                } as any
            ]
        },
        {
            id: 'storm_kiln_artist_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Treasure',
                        types: ['Artifact'],
                        subtypes: ['Treasure'],
                        colors: [],
                        oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
                        abilities: [
                            {
                                id: 'treasure_sac',
                                type: AbilityType.Activated,
                                costs: [{ type: 'Tap' }, { type: 'Sacrifice', restrictions: ['SELF'] }],
                                effects: [{ type: 'AddMana', amount: '{ANY}' }]
                            }
                        ]
                    }
                } as any
            ]
        }
    ]
};
