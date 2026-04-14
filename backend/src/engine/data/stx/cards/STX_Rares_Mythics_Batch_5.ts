import { CardDefinition, Zone, AbilityType, EffectType, TriggerEvent, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_5: CardDefinition[] = [
    {
        name: "Valentin, Dean of the Vein",
        manaCost: "{B}",
        colors: ["B"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Vampire", "Warlock"],
        power: "1",
        toughness: "1",
        keywords: ["Menace", "Lifelink"],
        oracleText: "Menace, lifelink\nIf a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
        faces: [
            {
                name: "Valentin, Dean of the Vein",
                manaCost: "{B}",
                colors: ["B"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Vampire", "Warlock"],
                power: "1",
                toughness: "1",
                keywords: ["Menace", "Lifelink"],
                oracleText: "Menace, lifelink\nIf a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
                abilities: [
                    {
                        type: AbilityType.Static,
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            layer: 6,
                            targetMapping: TargetMapping.MatchingCards,
                            restrictions: [{ type: 'OpponentControl' }, { type: 'Type', value: 'Creature' }, { type: 'Not', restriction: { type: 'Token' } }]
                        }]
                    },
                    {
                        type: AbilityType.Triggered,
                    eventMatch: 'ON_VALENTIN_REPLACEMENT_SUCCESS', 
                        oracleText: "When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
                        effects: [{
                            type: EffectType.Choice,
                            label: "Pay {2} to create a Pest?",
                            optional: true,
                            choices: [{
                                label: "Pay {2}",
                                costs: [{ type: 'Mana', value: '{2}' }],
                                effects: [{
                                    type: EffectType.CreateToken,
                                    tokenBlueprint: {
                                        name: 'Pest',
                                        power: "1",
                                        toughness: "1",
                                        colors: ['B', 'G'],
                                        types: ['Creature', 'Token'],
                                        subtypes: ['Pest'],
                                        oracleText: "When this creature dies, you gain 1 life.",
                                        abilities: [{
                                            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                                        }]
                                    }
                                }]
                            }]
                        }]
                    }
                ]
            },
            {
                name: "Lisette, Dean of the Root",
                manaCost: "{2}{G}{G}",
                colors: ["G"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Human", "Druid"],
                power: "4",
                toughness: "4",
                oracleText: "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.",
                abilities: [{
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
                    oracleText: "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.",
                    effects: [{
                        type: EffectType.Choice,
                        label: "Pay {1} to buff creatures?",
                        optional: true,
                        choices: [{
                            label: "Pay {1}",
                            costs: [{ type: 'Mana', value: '{1}' }],
                            effects: [
                                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: 'ALL_CREATURES_YOU_CONTROL' },
                                { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Trample'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }
                            ]
                        }]
                    }]
                }]
            }
        ]
    },
    {
        name: "Selfless Glyphweaver",
        manaCost: "{2}{W}",
        colors: ["W"],
        types: ["Creature"],
        subtypes: ["Human", "Cleric"],
        power: "2",
        toughness: "3",
        oracleText: "Exile Selfless Glyphweaver: Creatures you control gain indestructible until end of turn.",
        faces: [
            {
                name: "Selfless Glyphweaver",
                manaCost: "{2}{W}",
                colors: ["W"],
                types: ["Creature"],
                subtypes: ["Human", "Cleric"],
                power: "2",
                toughness: "3",
                oracleText: "Exile Selfless Glyphweaver: Creatures you control gain indestructible until end of turn.",
                abilities: [{
                    type: AbilityType.Activated,
                    costs: [{ type: 'Exile', targetMapping: TargetMapping.Self }],
                    effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Indestructible'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
                }]
            },
            {
                name: "Deadly Vanity",
                manaCost: "{5}{B}{B}",
                colors: ["B"],
                types: ["Sorcery"],
                oracleText: "Choose target creature or planeswalker. Destroy all other creatures and planeswalkers.",
                abilities: [{
                    type: AbilityType.Spell,
                    targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }] },
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.AllOtherCreaturesAndPlaneswalkers, excludedTargetMapping: TargetMapping.Target1 }]
                }]
            }
        ]
    },
    {
        name: "Torrent Sculptor",
        manaCost: "{2}{U}{R}",
        colors: ["U", "R"],
        types: ["Creature"],
        subtypes: ["Elemental", "Lizard"],
        power: "2",
        toughness: "2",
        keywords: ["Ward {2}"],
        oracleText: "Ward {2}\nWhen Torrent Sculptor enters the battlefield, you may exile an instant or sorcery card from your graveyard. If you do, put a +1/+1 counter on Torrent Sculptor for each mana value of the exiled card.",
        faces: [
            {
                name: "Torrent Sculptor",
                manaCost: "{2}{U}{R}",
                colors: ["U", "R"],
                types: ["Creature"],
                subtypes: ["Elemental", "Lizard"],
                power: "2",
                toughness: "2",
                keywords: ["Ward {2}"],
                oracleText: "Ward {2}\nWhen Torrent Sculptor enters the battlefield, you may exile an instant or sorcery card from your graveyard. If you do, put a +1/+1 counter on Torrent Sculptor for each mana value of the exiled card.",
                abilities: [{
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    effects: [{
                        type: EffectType.Choice,
                        label: "Exile instant/sorcery for counters?",
                        optional: true,
                        choices: [{
                            label: "Exile",
                            effects: [{
                                type: EffectType.Exile,
                                sourceZone: Zone.Graveyard,
                                restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }],
                                storeMV: 'SAVED_MV'
                            }, {
                                type: EffectType.AddCounters,
                                counterType: 'P1P1',
                                amount: DynamicAmount.SavedMV,
                                targetMapping: TargetMapping.Self
                            }]
                        }]
                    }]
                }]
            },
            {
                name: "Flamethrower Sonata",
                manaCost: "{1}{R}",
                colors: ["R"],
                types: ["Sorcery"],
                oracleText: "As an additional cost to cast this spell, discard a card. Flamethrower Sonata deals damage to target creature or planeswalker equal to 2 plus the mana value of the discarded card. If an instant or sorcery card was discarded this way, draw a card.",
                abilities: [{
                    type: AbilityType.Spell,
                    costs: [{ type: 'Discard', value: 1 }],
                    targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }] },
                    effects: [
                        { type: EffectType.DealDamage, amount: DynamicAmount.TwoPlusDiscardedMV, targetMapping: TargetMapping.Target1 },
                        { type: EffectType.Choice, condition: 'IS_INSTANT_OR_SORCERY_DISCARDED', choices: [{ label: 'Draw', effects: [{ type: EffectType.DrawCards, amount: 1 }] }] }
                    ]
                }]
            }
        ]
    },
    {
        name: "Plargg, Dean of Chaos",
        manaCost: "{1}{R}",
        colors: ["R"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Orc", "Shaman"],
        power: "2",
        toughness: "2",
        oracleText: "{T}, Discard a card: Draw a card.\n{4}{R}, {T}: Reveal cards from the top of your library until you reveal a nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
        faces: [
            {
                name: "Plargg, Dean of Chaos",
                manaCost: "{1}{R}",
                colors: ["R"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Orc", "Shaman"],
                power: "2",
                toughness: "2",
                oracleText: "{T}, Discard a card: Draw a card.\n{4}{R}, {T}: Reveal cards from the top of your library until you reveal a nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
                abilities: [
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }, { type: 'Discard', value: 1 }],
                        effects: [{ type: EffectType.DrawCards, amount: 1 }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Mana', value: '{4}{R}' }, { type: 'Tap', targetMapping: TargetMapping.Self }],
                        effects: [{
                            type: EffectType.SearchLibrary,
                            fromTop: -1,
                            restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Land' } }, { type: 'Attribute', attribute: 'ManaValue', value: 3, comparison: 'LE' }],
                            destination: Zone.Exile,
                            effects: [{
                                type: EffectType.Choice,
                                label: 'Cast revealed spell?',
                                optional: true,
                                choices: [{
                                    label: 'Cast',
                                    effects: [{ type: EffectType.CastSpell, targetMapping: 'SELECTED_CARD', isFreeCast: true }]
                                }]
                            }]
                        }]
                    }
                ]
            },
            {
                name: "Augusta, Dean of Order",
                manaCost: "{2}{W}",
                colors: ["W"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Human", "Cleric"],
                power: "1",
                toughness: "3",
                oracleText: "Other creatures you control get +1/+0 as long as they're attacking.\nWhenever you attack, untap all creatures you control.",
                abilities: [
                    {
                        type: AbilityType.Static,
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            powerModifier: 1,
                            targetMapping: TargetMapping.AllCreaturesYouControl,
                            restrictions: [{ type: 'Attacking' }, { type: 'Not', restriction: { type: 'Self' } }]
                        }]
                    },
                    {
                        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                        condition: "OnYourAttack",
                        effects: [{ type: EffectType.Untap, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
                    }
                ]
            }
        ]
    }
];


