import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SilverquillPledgemage: ImplementableCard = {
    name: 'Silverquill Pledgemage',
    manaCost: '{1}{W/B}{W/B}',
    type_line: 'Creature — Vampire Cleric',
    types: ['Creature'],
    subtypes: ['Vampire', 'Cleric'],
    power: '3',
    toughness: '1',
    colors: ['white', 'black'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Silverquill Pledgemage gains flying or lifelink until end of turn.",
    abilities: [
        {
            id: 'silverquill_pledgemage_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose Ability',
                    choices: [
                        { label: 'Flying', effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: 'SELF', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'] }] },
                        { label: 'Lifelink', effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: 'SELF', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'] }] }
                    ]
                }
            ]
        }
    ]
};

export const PrismariPledgemage: ImplementableCard = {
    name: 'Prismari Pledgemage',
    manaCost: '{UR}{UR}',
    type_line: 'Creature — Orc Shaman',
    types: ['Creature'],
    subtypes: ['Orc', 'Shaman'],
    power: '3',
    toughness: '3',
    colors: ['blue', 'red'],
    oracleText: "",
    abilities: []
};

export const WitherbloomPledgemage: ImplementableCard = {
    name: 'Witherbloom Pledgemage',
    manaCost: '{2}{B/G}{B/G}',
    type_line: 'Creature — Treefolk Druid',
    types: ['Creature'],
    subtypes: ['Treefolk', 'Druid'],
    power: '4',
    toughness: '3',
    colors: ['black', 'green'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Witherbloom Pledgemage gets +1/+0 and gains first strike until end of turn.",
    abilities: [
        {
            id: 'witherbloom_pledgemage_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    abilitiesToAdd: ['First strike']
                }
            ]
        }
    ]
};

export const LoreholdPledgemage: ImplementableCard = {
    name: 'Lorehold Pledgemage',
    manaCost: '{1}{R/W}{R/W}',
    type_line: 'Creature — Rhino Cleric',
    types: ['Creature'],
    subtypes: ['Rhino', 'Cleric'],
    power: '2',
    toughness: '2',
    colors: ['red', 'white'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Lorehold Pledgemage gets +1/+1 until end of turn.",
    abilities: [
        {
            id: 'lorehold_pledgemage_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    toughnessModifier: 1
                }
            ]
        }
    ]
};

export const QuandrixPledgemage: ImplementableCard = {
    name: 'Quandrix Pledgemage',
    manaCost: '{1}{G/U}{G/U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    colors: ['green', 'blue'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Quandrix Pledgemage.",
    abilities: [
        {
            id: 'quandrix_pledgemage_magecraft',
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
        }
    ]
};
