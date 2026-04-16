import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_2: CardDefinition[] = [
    {
        name: "Galazeth Prismari",
        manaCost: "{2}{U}{R}",
        colors: ["U", "R"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "3",
        toughness: "4",
        keywords: ["Flying"],
        oracleText: "Flying. When Galazeth Prismari enters the battlefield, create a Treasure token. Artifacts you control have '{T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.'",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Treasure', types: ['Artifact', 'Token'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' } }]
            },
            {
                type: AbilityType.Static,
                effects: [{
                    type: EffectType.AddActivatedAbility, 
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [{ type: 'Type', value: 'Artifact' }],
                    abilitiesToAdd: [{
                        id: 'galazeth_mana_ability',
                        type: AbilityType.Activated,
                        costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }],
                        effects: [{ 
                            type: EffectType.AddMana, 
                            amount: 1,
                            manaType: 'ANY',
                            manaRestriction: { types: ['Instant', 'Sorcery'] }
                        }]
                    }]
                }]
            }
        ]
    },
    {
        name: "Shadrix Silverquill",
        manaCost: "{3}{W}{B}",
        colors: ["W", "B"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "2",
        toughness: "5",
        keywords: ["Flying", "Double Strike"],
        oracleText: "Flying, double strike. At the beginning of combat on your turn, choose two. Each mode must target a different player.\n• Target player creates a 2/1 white and black Inkling creature token with flying.\n• Target player draws a card and loses 1 life.\n• Target player puts a +1/+1 counter on each creature they control.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
                condition: "IS_YOUR_TURN",
                effects: [{
                    type: EffectType.Choice,
                    label: "Choose two modes (must different targets)",
                    minChoices: 2,
                    maxChoices: 2,
                    choices: [
                        {
                            label: "Create Inkling",
                            targetDefinition: { count: 1, type: TargetType.Player },
                            effects: [{ type: EffectType.CreateToken, targetMapping: TargetMapping.Target1, tokenBlueprint: { name: 'Inkling', power: "2", toughness: "1", keywords: ['Flying'], colors: ['W', 'B'], types: ['Creature', 'Token'], subtypes: ['Inkling'] } }]
                        },
                        {
                            label: "Draw & Lose Life",
                            targetDefinition: { count: 1, type: TargetType.Player },
                            effects: [
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1 },
                                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Target1 }
                            ]
                        },
                        {
                            label: "Counters on all creatures",
                            targetDefinition: { count: 1, type: TargetType.Player },
                            effects: [{ 
                                type: EffectType.AddCounters, 
                                counterType: 'P1P1', 
                                amount: 1, 
                                targetMapping: TargetMapping.AllMatchingPermanents,
                                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Controller', targetMapping: TargetMapping.Target1 }]
                            }]
                        }
                    ]
                }]
            }
        ]
    },
    {
        name: "Velomachus Lorehold",
        manaCost: "{5}{R}{W}",
        colors: ["R", "W"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "5",
        toughness: "5",
        keywords: ["Flying", "Vigilance", "Haste"],
        oracleText: "Flying, vigilance, haste. Whenever Velomachus Lorehold attacks, look at the top seven cards of your library. You may cast an instant or sorcery spell with mana value less than or equal to Velomachus Lorehold's power from among them without paying its mana cost. Put the rest on the bottom of your library in a random order.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                condition: "SelfAttacks",
                effects: [{
                    type: EffectType.SearchLibrary,
                    fromTop: 7,
                    optional: true,
                    restrictions: ['Instant_OR_Sorcery', 'MV_LE_SOURCE_POWER'],
                    zone: Zone.Stack,
                    isFreeCast: true,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true
                }]
            }
        ]
    },
    {
        name: "Mila, Crafty Companion",
        manaCost: "{1}{W}{W}",
        colors: ["W"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Fox"],
        power: "2",
        toughness: "3",
        oracleText: "Whenever an opponent attacks one or more planeswalkers you control, create a 1/1 white Spirit creature token. Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
        faces: [
            {
                name: "Mila, Crafty Companion",
                manaCost: "{1}{W}{W}",
                colors: ["W"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Fox"],
                power: "2",
                toughness: "3",
                oracleText: "Whenever an opponent attacks one or more planeswalkers you control, create a 1/1 white Spirit creature token. Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
                abilities: [
                    {
                        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                        condition: "OpponentAttacksYourPlaneswalker",
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Spirit', power: "1", toughness: "1", colors: ['W'], types: ['Creature', 'Token'], subtypes: ['Spirit'] } }]
                    },
                    {
                        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BecomeTarget,
                        condition: "OpponentTargetsYourPermanent",
                        effects: [{ type: EffectType.DrawCards, amount: 1, optional: true }]
                    }
                ]
            },
            {
                name: "Lukka, Wayward Bondbreaker",
                manaCost: "{4}{R}{R}",
                colors: ["R"],
                supertypes: ["Legendary"],
                types: ["Planeswalker"],
                subtypes: ["Lukka"],
                loyalty: "5",
                oracleText: "[+1]: You may exile a creature card from your graveyard. If you do, create a 3/3 red Beast creature token.\n[-2]: Exile target creature you control, then reveal cards from the top of your library until you reveal a creature card with mana value greater than the exiled creature's mana value. Put that card onto the battlefield and the rest on the bottom in a random order.\n[-7]: You get an emblem with \"Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.\"",
                abilities: [
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '+1' }],
                        effects: [{
                            type: EffectType.Choice,
                            label: "Exile a creature card from graveyard?",
                            optional: true,
                            choices: [{
                                label: "Exile & Create Beast",
                                effects: [
                                    { type: EffectType.Exile, sourceZone: Zone.Graveyard, restrictions: [{ type: 'Type', value: 'Creature' }] },
                                    { type: EffectType.CreateToken, tokenBlueprint: { name: 'Beast', power: "3", toughness: "3", colors: ['R'], types: ['Creature', 'Token'], subtypes: ['Beast'] } }
                                ]
                            }]
                        }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-2' }],
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }] },
                        effects: [
                            { type: EffectType.Exile, targetMapping: TargetMapping.Target1, storeMV: 'SAVED_MV' },
                            {
                                type: EffectType.SearchLibrary,
                                fromTop: -1, 
                                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'ManaValueGreaterThanSaved' }],
                                zone: Zone.Battlefield,
                                remainderZone: Zone.Library,
                                remainderPosition: 'bottom',
                                shuffleRemainder: true
                            }
                        ]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-7' }],
                        effects: [{
                            type: EffectType.CreateEmblem,
                            emblemBlueprint: {
                                name: "Lukka's Emblem",
                                oracleText: "Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.",
                                abilities: [{
                                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefieldOther,
                                    condition: "TargetYourPermanent_OpponentSource",
                                    targetDefinition: { count: 1, type: TargetType.AnyTarget },
                                    effects: [{ type: EffectType.DealDamage, amount: DynamicAmount.SourcePower, targetMapping: TargetMapping.Target1 }]
                                }]
                            }
                        }]
                    }
                ]
            }
        ]
    },
    {
        name: "Rowan, Scholar of Sparks",
        manaCost: "{2}{R}",
        colors: ["R"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Rowan"],
        loyalty: "2",
        oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Rowan, Scholar of Sparks deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.\n[-4]: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.\"",
        faces: [
            {
                name: "Rowan, Scholar of Sparks",
                manaCost: "{2}{R}",
                colors: ["R"],
                supertypes: ["Legendary"],
                types: ["Planeswalker"],
                subtypes: ["Rowan"],
                loyalty: "2",
                oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Rowan, Scholar of Sparks deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.\n[-4]: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.\"",
                abilities: [
                    {
                        type: AbilityType.Static,
                        effects: [{ type: EffectType.CostReduction, amount: '{1}', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '+1' }],
                        effects: [{
                            type: EffectType.DealDamage,
                            amount: DynamicAmount.DrawnThreeCheck, 
                            targetMapping: TargetMapping.EachOpponent
                        }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-4' }],
                        effects: [{
                            type: EffectType.CreateEmblem,
                            emblemBlueprint: {
                                name: "Rowan's Emblem",
                                oracleText: "Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.",
                                abilities: [{
                                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
                                    effects: [{
                                        type: EffectType.Choice,
                                        label: "Pay {2} to copy spell?",
                                        optional: true,
                                        choices: [{
                                            label: "Pay {2}",
                                            costs: [{ type: 'Mana', value: '{2}' }],
                                            effects: [{ type: EffectType.CopySpellOnStack, targetMapping: TargetMapping.TriggerEventSource }]
                                        }]
                                    }]
                                }]
                            }
                        }]
                    }
                ]
            },
            {
                name: "Will, Scholar of Frost",
                manaCost: "{4}{U}",
                colors: ["U"],
                supertypes: ["Legendary"],
                types: ["Planeswalker"],
                subtypes: ["Will"],
                loyalty: "4",
                oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Up to one target creature has base power and toughness 0/2 and loses all abilities until your next turn.\n[-3]: Draw two cards.\n[-7]: Exile up to five target instant or sorcery cards from any graveyard. You may cast them without paying their mana costs.",
                abilities: [
                    {
                        type: AbilityType.Static,
                        effects: [{ type: EffectType.CostReduction, amount: '{1}', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '+1' }],
                        targetDefinition: { count: 1, type: TargetType.Permanent, optional: true, restrictions: [{ type: 'Type', value: 'Creature' }] },
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            duration: 'UNTIL_YOUR_NEXT_TURN',
                            powerSet: 0,
                            toughnessSet: 2,
                            abilitiesToAdd: [],
                            removeAllAbilities: true,
                            layer: 6,
                            targetMapping: TargetMapping.Target1
                        }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-3' }],
                        effects: [{ type: EffectType.DrawCards, amount: 2 }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-7' }],
                        targetDefinition: { count: 5, type: TargetType.Card, optional: true, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }, { type: 'Source', value: 'GRAVEYARD' }] },
                        effects: [
                            { type: EffectType.Exile, targetMapping: TargetMapping.TargetAll },
                            { type: EffectType.CastSpell, targetMapping: TargetMapping.TargetAll, isFreeCast: true }
                        ]
                    }
                ]
            }
        ]
    }
];



