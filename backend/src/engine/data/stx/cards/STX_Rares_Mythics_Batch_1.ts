import { CardDefinition, Zone, AbilityType, EffectType, TriggerEvent, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_1: CardDefinition[] = [
    {
        name: "Hofri Ghostforge",
        manaCost: "{3}{R}{W}",
        colors: ["R", "W"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Dwarf", "Cleric"],
        power: "4",
        toughness: "5",
        oracleText: "Spirits you control get +1/+1 and have trample and haste. Whenever another nontoken creature you control dies, exile it. If you do, create a token that's a copy of that creature, except it's a Spirit in addition to its other types and it has \"When this creature leaves the battlefield, return the exiled card to its owner's graveyard.\"",
        abilities: [
            {
                type: AbilityType.Static,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        toughnessModifier: 1,
                        layer: 7,
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: [{ type: 'Subtype', value: 'Spirit' }]
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Trample", "Haste"],
                        layer: 6,
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: [{ type: 'Subtype', value: 'Spirit' }]
                    }
                ]
            },
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                condition: "AnotherNontokenCreatureYouControlDies",
                effects: [{
                    type: EffectType.Choice,
                    label: "Hofri: Exile and create Spirit token?",
                    optional: true,
                    choices: [{
                        label: "Exile & Copy",
                        effects: [
                            { type: EffectType.Exile, targetMapping: TargetMapping.TriggerEventSource },
                            {
                                type: EffectType.CreateTokenCopy,
                                targetMapping: TargetMapping.TriggerEventSource,
                                subtypesToAdd: ["Spirit"],
                                storeLinkedId: 'HOFRI_EXILE',
                                abilitiesToAdd: [{
                                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveBattlefield,
                                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: 'LINKED_OBJECT', linkKey: 'HOFRI_EXILE' }]
                                }]
                            }
                        ]
                    }]
                }]
            }
        ]
    },
    {
        name: "Professor Onyx",
        manaCost: "{4}{B}{B}",
        colors: ["B"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Onyx"],
        loyalty: "5",
        oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 2 life and you gain 2 life.\n+1: You lose 1 life. Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.\n−3: Each opponent sacrifices a creature with the greatest power among creatures that player controls.\n−8: Each opponent may discard a card. If they don't, they lose 3 life. Repeat this process six more times.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [
                    { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachOpponent },
                    { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
                ]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '1' }],
                effects: [
                    { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.LookAtTopAndPick,
                        fromTop: 3,
                        amount: 1,
                        destination: Zone.Hand,
                        remainderZone: Zone.Graveyard
                    }
                ]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-3' }],
                effects: [{
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachOpponent,
                    restrictions: [{ type: 'GreatestPower' }]
                }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-8' }],
                effects: Array(7).fill({
                    type: EffectType.Choice,
                    label: "Each opponent: Discard or lose 3 life?",
                    targetMapping: TargetMapping.EachOpponent,
                    choices: [
                        { label: "Discard", effects: [{ type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Self }] },
                        { label: "Lose 3 Life", effects: [{ type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Self }] }
                    ]
                })
            }
        ]
    },
    {
        name: "Kasmina, Enigma Sage",
        manaCost: "{1}{G}{U}",
        colors: ["G", "U"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Kasmina"],
        loyalty: "2",
        oracleText: "Each other planeswalker you control has the loyalty abilities of Kasmina, Enigma Sage. +2: Scry 1. -X: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it. -8: Search your library for an instant or sorcery card that shares a color with this planeswalker, exile that card, then shuffle. You may cast that card without paying its mana cost.",
        abilities: [
            {
                type: AbilityType.Static,
                effects: [{
                    type: EffectType.AddActivatedAbility,
                    targetMapping: TargetMapping.OtherPlaneswalkersYouControl,
                    abilitiesToAdd: [
                        { id: 'kasmina_granted_1', type: AbilityType.Activated, costs: [{ type: 'Loyalty', value: '+2' }], effects: [{ type: EffectType.Scry, amount: 1 }] },
                        { id: 'kasmina_granted_2', type: AbilityType.Activated, costs: [{ type: 'Loyalty', value: '-X' }], effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Fractal', power: "0", toughness: "0", colors: ['G', 'U'], types: ['Creature'], subtypes: ['Fractal'] }, startingCounters: { type: 'P1P1', amount: DynamicAmount.X } }] },
                        { id: 'kasmina_granted_3', type: AbilityType.Activated, costs: [{ type: 'Loyalty', value: '-8' }], effects: [{ type: EffectType.SearchLibrary, zone: Zone.Stack, isFreeCast: true, restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }, { type: 'SharesColorWithSource' }] }] }
                    ]
                }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '+2' }],
                effects: [{ type: EffectType.Scry, amount: 1 }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-X' }],
                effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Fractal', power: "0", toughness: "0", colors: ['G', 'U'], types: ['Creature'], subtypes: ['Fractal'] }, startingCounters: { type: 'P1P1', amount: DynamicAmount.X } }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-8' }],
                effects: [{ type: EffectType.SearchLibrary, zone: Zone.Stack, isFreeCast: true, restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }, { type: 'SharesColorWithSource' }] }]
            }
        ]
    },
    {
        name: "Beledros Witherbloom",
        manaCost: "{5}{B}{G}",
        colors: ["B", "G"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "4",
        toughness: "4",
        keywords: ["Flying"],
        oracleText: "Flying. At the beginning of each upkeep, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"\nPay 10 life: Untap all lands you control. Activate only once each turn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Upkeep,
                effects: [{ 
                    type: EffectType.CreateToken, 
                    tokenBlueprint: { 
                        name: 'Pest', 
                        power: "1", 
                        toughness: "1", 
                        colors: ['B', 'G'], 
                        types: ['Creature', 'Token'], 
                        subtypes: ['Pest'],
                        abilities: [{
                            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                        }]
                    } 
                }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'PayLife', value: 10 }],
                restrictions: [{ type: 'OncePerTurn' }],
                effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.AllLandsYouControl }]
            }
        ]
    },
    {
        name: "Tanazir Quandrix",
        manaCost: "{3}{G}{U}",
        colors: ["G", "U"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "4",
        toughness: "4",
        keywords: ["Flying", "Trample"],
        oracleText: "Flying, trample. When Tanazir Quandrix enters the battlefield, choose target creature you control. Put a number of +1/+1 counters on it equal to Tanazir Quandrix's power. Whenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become Tanazir Quandrix's power and toughness until end of turn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }] },
                effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: DynamicAmount.SourcePower, targetMapping: TargetMapping.Target1 }]
            },
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                condition: "SelfAttacks",
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    optional: true,
                    targetMapping: TargetMapping.OtherCreaturesYouControl,
                    powerSet: DynamicAmount.SourcePower,
                    toughnessSet: DynamicAmount.SourceToughness
                }]
            }
        ]
    }
];


