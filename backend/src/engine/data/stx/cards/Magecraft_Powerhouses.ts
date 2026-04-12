import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const StormKilnArtist: ImplementableCard = {
    name: 'Storm-Kiln Artist',
    manaCost: '{3}{R}',
    type_line: 'Creature — Dwarf Shaman',
    types: ['Creature'],
    subtypes: ['Dwarf', 'Shaman'],
    power: '2',
    toughness: '2',
    colors: ['red'],
    oracleText: "Storm-Kiln Artist gets +1/+0 for each artifact you control.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.",
    abilities: [
        {
            id: 'storm_kiln_static',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    powerDynamic: 'COUNT_MATCHING:Artifact,YouControl',
                    layer: 7
                }
            ]
        },
        {
            id: 'storm_kiln_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Treasure',
                        types: ['Artifact'],
                        subtypes: ['Treasure'],
                        colors: [],
                        oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
                        abilities: [
                            {
                                id: 'treasure_mana',
                                type: AbilityType.Activated,
                                isManaAbility: true,
                                costs: [{ type: 'Tap' }, { type: 'Sacrifice', restrictions: ['SELF'] }],
                                effects: [{ type: EffectType.AddMana, value: '{ANY}' }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

export const ArchmageEmeritus: ImplementableCard = {
    name: 'Archmage Emeritus',
    manaCost: '{2}{U}{U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    colors: ['blue'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.",
    abilities: [
        {
            id: 'archmage_emeritus_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.DrawCards,
                    targetMapping: 'CONTROLLER',
                    amount: 1
                }
            ]
        }
    ]
};

export const CleverLumimancer: ImplementableCard = {
    name: 'Clever Lumimancer',
    manaCost: '{W}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '1',
    colors: ['white'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Clever Lumimancer gets +2/+2 until end of turn.",
    abilities: [
        {
            id: 'clever_lumimancer_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 2,
                    toughnessModifier: 2
                }
            ]
        }
    ]
};

export const DragonsguardElite: ImplementableCard = {
    name: 'Dragonsguard Elite',
    manaCost: '{1}{G}',
    type_line: 'Creature — Human Druid',
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    colors: ['green'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Dragonsguard Elite.\n{4}{G}{G}: Double the number of +1/+1 counters on Dragonsguard Elite.",
    abilities: [
        {
            id: 'dragonsguard_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        },
        {
            id: 'dragonsguard_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    value: '+1/+1',
                    amount: (state: any, source: any) => {
                        const obj = state.battlefield.find((o: any) => o.id === source.sourceId);
                        return obj?.counters?.['+1/+1'] || 0;
                    }
                }
            ]
        }
    ]
};
