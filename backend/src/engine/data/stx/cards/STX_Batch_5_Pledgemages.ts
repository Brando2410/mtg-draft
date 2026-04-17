import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Batch_5_Pledgemages: CardDefinition[] = [
  {
    name: 'Silverquill Pledgemage',
    manaCost: '{1}{W/B}{W/B}',
    colors: ['W', 'B'],
    types: ['Creature'],
    subtypes: ['Vampire', 'Cleric'],
    power: '3',
    toughness: '1',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Silverquill Pledgemage gains flying or lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose an ability for Silverquill Pledgemage",
                    choices: [
                        { label: 'Flying', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'], targetMapping: TargetMapping.Self }] },
                        { label: 'Lifelink', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'], targetMapping: TargetMapping.Self }] }
                    ]
                }
            ]
        }
    ]
  },
  {
    name: 'Quandrix Pledgemage',
    manaCost: '{1}{G/U}{G/U}',
    colors: ['G', 'U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Quandrix Pledgemage.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Self }]
        }
    ]
  },
  {
    name: 'Prismari Pledgemage',
    manaCost: '{U/R}{U/R}', // Scryfall: {U/R}{U/R}
    colors: ['U', 'R'],
    types: ['Creature'],
    subtypes: ['Orc', 'Shaman'],
    power: '3',
    toughness: '3',
    keywords: ['Defender'],
    oracleText: "Defender\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Pledgemage can attack this turn as though it didn't have defender.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToRemove: ['Defender'], targetMapping: TargetMapping.Self }]
        }
    ]
  },
  {
    name: 'Lorehold Pledgemage',
    manaCost: '{1}{R/W}{R/W}', // Scryfall: {1}{R/W}{R/W}
    colors: ['R', 'W'],
    types: ['Creature'],
    subtypes: ['Rhino', 'Cleric'],
    power: '2',
    toughness: '2',
    keywords: ['First strike'],
    oracleText: 'First strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Lorehold Pledgemage gets +1/+1 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: 'UNTIL_END_OF_TURN', targetMapping: TargetMapping.Self }]
        }
    ]
  },
  {
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
  },
  {
    name: "Silverquill Apprentice",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Duelist"], // Scryfall: Human Duelist
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature gets +1/+0 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, duration: 'UNTIL_END_OF_TURN', targetMapping: TargetMapping.Target1 }]
        }
    ]
  },
  {
    name: "Quandrix Apprentice",
    manaCost: "{G}{U}",
    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, look at the top three cards of your library. You may reveal a land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    optional: true,
                    restrictions: [
                { type: 'Type', value: 'Land' }
            ],
                    reveal: true,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
  },
  {
    name: "Prismari Apprentice",
    manaCost: "{U}{R}",
    colors: ["U", "R"],
    types: ["Creature"],
    subtypes: ["Human", "Shaman"], // Scryfall: Human Shaman
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Apprentice can't be blocked this turn. Then if that spell has mana value 5 or greater, put a +1/+1 counter on Prismari Apprentice.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.ApplyContinuousEffect, abilitiesToAdd: ['CannotBeBlocked'], duration: 'UNTIL_END_OF_TURN', targetMapping: TargetMapping.Self },
                {
                    type: EffectType.Choice,
                    label: "Add +1/+1 counter if MV >= 5",
                    condition: "TRIGGER_EVENT_SOURCE_MV_GE_5",
                    effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Self }]
                }
            ]
        }
    ]
  },
  {
    name: "Lorehold Apprentice",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"], // Scryfall: Human Cleric
    power: "2",
    toughness: "1",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each Spirit you control deals 1 damage to each opponent.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent,
                    damageSourceMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                { type: 'Subtype',
                value: 'Spirit' }
            ]
                }
            ]
        }
    ]
  },
  {
    name: "Witherbloom Apprentice",
    manaCost: "{B}{G}",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Human", "Druid"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
  }
];


