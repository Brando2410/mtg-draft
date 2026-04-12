import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType, TargetType, Zone } from '@shared/engine_types';

export const SilverquillApprentice: ImplementableCard = {
    name: 'Silverquill Apprentice',
    manaCost: '{W}{B}',
    type_line: 'Creature — Human Duelist',
    types: ['Creature'],
    subtypes: ['Human', 'Duelist'],
    power: '2',
    toughness: '2',
    colors: ['white', 'black'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature gets +1/+0 until end of turn.",
    abilities: [
        {
            id: 'silverquill_apprentice_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET_1',
                    powerModifier: 1,
                    duration: 'UNTIL_END_OF_TURN'
                }
            ]
        }
    ]
};

export const PrismariApprentice: ImplementableCard = {
    name: 'Prismari Apprentice',
    manaCost: '{U}{R}',
    type_line: 'Creature — Human Shaman',
    types: ['Creature'],
    subtypes: ['Human', 'Shaman'],
    power: '2',
    toughness: '2',
    colors: ['blue', 'red'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Prismari Apprentice, then it can't be blocked this turn.",
    abilities: [
        {
            id: 'prismari_apprentice_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1'
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    restrictions: [{ type: 'Restriction', value: 'CANNOT_BE_BLOCKED' }]
                }
            ]
        }
    ]
};

export const WitherbloomApprentice: ImplementableCard = {
    name: 'Witherbloom Apprentice',
    manaCost: '{B}{G}',
    type_line: 'Creature — Human Druid',
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    colors: ['black', 'green'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            id: 'witherbloom_apprentice_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.LoseLife,
                    targetMapping: 'EACH_OPPONENT',
                    amount: 1
                },
                {
                    type: EffectType.GainLife,
                    targetMapping: 'CONTROLLER',
                    amount: 1
                }
            ]
        }
    ]
};

export const LoreholdApprentice: ImplementableCard = {
    name: 'Lorehold Apprentice',
    manaCost: '{R}{W}',
    type_line: 'Creature — Human Cleric',
    types: ['Creature'],
    subtypes: ['Human', 'Cleric'],
    power: '2',
    toughness: '1',
    colors: ['red', 'white'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Spirits you control gain \"{T}: This creature deals 1 damage to each opponent\" until end of turn.",
    abilities: [
        {
            id: 'lorehold_apprentice_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'ALL_MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Spirit'],
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: [
                        {
                            id: 'granted_spirit_damage',
                            type: AbilityType.Activated,
                            costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                            effects: [{ type: EffectType.DealDamage, amount: 1, targetMapping: 'EACH_OPPONENT' }]
                        }
                    ]
                }
            ]
        }
    ]
};

export const QuandrixApprentice: ImplementableCard = {
    name: 'Quandrix Apprentice',
    manaCost: '{G}{U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    colors: ['green', 'blue'],
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, look at the top three cards of your library. You may reveal a land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            id: 'quandrix_apprentice_magecraft',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Magecraft,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    optional: true,
                    restrictions: ['Land'],
                    reveal: true,
                    destination: Zone.Hand,
                    shuffleRemainder: true,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom'
                }
            ]
        }
    ]
};
