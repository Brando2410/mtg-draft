import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone, TriggerEvent, DurationType } from '@shared/engine_types';

export const STX_MDFCS: Record<string, ImplementableCard> = {
    "Valentin, Dean of the Vein": {
        name: "Valentin, Dean of the Vein",
        manaCost: "{B}",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Vampire", "Warlock"],
        power: "1",
        toughness: "1",
        keywords: ["Menace", "Lifelink"],
        oracleText: "Menace, lifelink\nIf a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
        faces: [
            { name: "Valentin, Dean of the Vein", manaCost: "{B}", colors: ["black"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Vampire", "Warlock"], power: "1", toughness: "1", keywords: ["Menace", "Lifelink"], oracleText: "..." },
            { name: "Lisette, Dean of the Root", manaCost: "{2}{G}{G}", colors: ["green"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Human", "Druid"], power: "4", toughness: "4", keywords: [], oracleText: "..." }
        ]
    },
    "Lisette, Dean of the Root": {
        name: "Lisette, Dean of the Root",
        manaCost: "{2}{G}{G}",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Druid"],
        power: "4",
        toughness: "4",
        keywords: [],
        oracleText: "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.",
    },
    "Selfless Glyphweaver": {
        name: "Selfless Glyphweaver",
        manaCost: "{2}{W}",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Cleric"],
        power: "2",
        toughness: "3",
        keywords: [],
        oracleText: "Exile Selfless Glyphweaver: Creatures you control gain indestructible until end of turn.",
        faces: [
            { name: "Selfless Glyphweaver", manaCost: "{2}{W}", colors: ["white"], supertypes: [], types: ["Creature"], subtypes: ["Human", "Cleric"], power: "2", toughness: "3", keywords: [], oracleText: "..." },
            { name: "Deadly Vanity", manaCost: "{5}{B}{B}", colors: ["black"], supertypes: [], types: ["Sorcery"], subtypes: [], keywords: [], oracleText: "..." }
        ]
    },
    "Deadly Vanity": {
        name: "Deadly Vanity",
        manaCost: "{5}{B}{B}",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        keywords: [],
        oracleText: "Choose a creature or planeswalker. Destroy all other creatures and planeswalkers."
    },
    "Torrent Sculptor": {
        name: "Torrent Sculptor",
        manaCost: "{2}{U}{R}",
        colors: ["blue", "red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental", "Lizard"],
        power: "2",
        toughness: "2",
        keywords: ["Ward {2}"],
        oracleText: "Ward {2}\nWhen Torrent Sculptor enters the battlefield, you may exile an instant or sorcery card from your graveyard. If you do, put a number of +1/+1 counters on Torrent Sculptor equal to that card's mana value.",
        faces: [
            { name: "Torrent Sculptor", manaCost: "{2}{U}{R}", colors: ["blue", "red"], supertypes: [], types: ["Creature"], subtypes: ["Elemental", "Lizard"], power: "2", toughness: "2", keywords: ["Ward {2}"], oracleText: "..." },
            { name: "Flamethrower Sonata", manaCost: "{1}{R}", colors: ["red"], supertypes: [], types: ["Sorcery"], subtypes: [], keywords: [], oracleText: "..." }
        ]
    },
    "Flamethrower Sonata": {
        name: "Flamethrower Sonata",
        manaCost: "{1}{R}",
        colors: ["red"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        keywords: [],
        oracleText: "Discard a card. Flamethrower Sonata deals damage to target creature or planeswalker equal to 2 plus the discarded card's mana value. If an instant or sorcery card was discarded this way, draw a card."
    },
    "Plargg, Dean of Chaos": {
        name: "Plargg, Dean of Chaos",
        manaCost: "{1}{R}",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Orc", "Shaman"],
        power: "2",
        toughness: "2",
        keywords: [],
        oracleText: "{T}, Discard a card: Draw a card.\n{4}{R}, {T}: [Cascade-like effect]",
        faces: [
            { name: "Plargg, Dean of Chaos", manaCost: "{1}{R}", colors: ["red"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Orc", "Shaman"], power: "2", toughness: "2", keywords: [], oracleText: "..." },
            { name: "Augusta, Dean of Order", manaCost: "{2}{W}", colors: ["white"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Human", "Cleric"], power: "1", toughness: "3", keywords: [], oracleText: "..." }
        ]
    },
    "Augusta, Dean of Order": {
        name: "Augusta, Dean of Order",
        manaCost: "{2}{W}",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Cleric"],
        power: "1",
        toughness: "3",
        keywords: [],
        oracleText: "Other tapped creatures you control get +1/+0. Other untapped creatures you control get +0/+1. Whenever you attack, you may untap all creatures you control."
    },
    "Rowan, Scholar of Sparks": {
        name: "Rowan, Scholar of Sparks",
        manaCost: "{2}{R}",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Rowan"],
        loyalty: "2",
        keywords: [],
        oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n+1: Rowan, Scholar of Sparks deals 1 damage to each opponent.\n-4: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may copy it. You may choose new targets for the copy.\"",
        faces: [
            { name: "Rowan, Scholar of Sparks", manaCost: "{2}{R}", colors: ["red"], supertypes: ["Legendary"], types: ["Planeswalker"], subtypes: ["Rowan"], loyalty: "2", keywords: [], oracleText: "..." },
            { name: "Will, Scholar of Frost", manaCost: "{4}{U}", colors: ["blue"], supertypes: ["Legendary"], types: ["Planeswalker"], subtypes: ["Will"], loyalty: "4", keywords: [], oracleText: "..." }
        ]
    },
    "Will, Scholar of Frost": {
        name: "Will, Scholar of Frost",
        manaCost: "{4}{U}",
        colors: ["blue"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Will"],
        loyalty: "4",
        keywords: [],
        oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n+1: Up to two target creatures each can't attack or block until your next turn.\n-3: Draw two cards.\n-7: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may copy it. You may choose new targets for the copy.\""
    },
    "Mila, Crafty Companion": {
        name: "Mila, Crafty Companion",
        manaCost: "{1}{W}{W}",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Fox"],
        power: "2",
        toughness: "3",
        keywords: [],
        oracleText: "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.\nWhenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
        faces: [
            { name: "Mila, Crafty Companion", manaCost: "{1}{W}{W}", colors: ["white"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Fox"], power: "2", toughness: "3", keywords: [], oracleText: "..." },
            { name: "Lukka, Wayward Bonder", manaCost: "{4}{R}{R}", colors: ["red"], supertypes: ["Legendary"], types: ["Planeswalker"], subtypes: ["Lukka"], loyalty: "5", keywords: [], oracleText: "..." }
        ]
    },
    "Lukka, Wayward Bonder": {
        name: "Lukka, Wayward Bonder",
        manaCost: "{4}{R}{R}",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Lukka"],
        loyalty: "5",
        keywords: [],
        oracleText: "+1: You may discard a card. If you do, draw a card. If a creature card was discarded this way, draw two cards instead.\n−2: Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next upkeep.\n−7: You get an emblem with \"Whenever a creature you control enters, it deals damage equal to its power to any target.\""
    },
    "Extus, Oriq Overlord": {
        name: "Extus, Oriq Overlord",
        manaCost: "{1}{W}{B}{B}",
        colors: ["white", "black"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Warlock"],
        power: "2",
        toughness: "4",
        keywords: ["Double strike"],
        oracleText: "Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target nonlegendary creature card from your graveyard to your hand.",
        faces: [
            { name: "Extus, Oriq Overlord", manaCost: "{1}{W}{B}{B}", colors: ["white", "black"], supertypes: ["Legendary"], types: ["Creature"], subtypes: ["Human", "Warlock"], power: "2", toughness: "4", keywords: ["Double strike"], oracleText: "..." },
            { name: "Awaken the Blood Avatar", manaCost: "{6}{B}{R}", colors: ["black", "red"], supertypes: [], types: ["Sorcery"], subtypes: [], keywords: [], oracleText: "..." }
        ]
    },
    "Awaken the Blood Avatar": {
        name: "Awaken the Blood Avatar",
        manaCost: "{6}{B}{R}",
        colors: ["black", "red"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        keywords: [],
        oracleText: "As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way.\nEach opponent sacrifices a creature. Create a 3/6 black and red Avatar creature token with haste and \"Whenever this token attacks, it deals 3 damage to each opponent.\""
    }
};

export const STX_MDFC_LOGIC: Record<string, { abilities: any[] }> = {
    "Valentin, Dean of the Vein": {
        abilities: [
            {
                id: "valentin_replacement",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.Death,
                triggerCondition: (state: any, event: any, source: any) => {
                    const deadObj = event.data?.object;
                    return deadObj && !deadObj.token && deadObj.controllerId !== source.controllerId;
                },
                effects: [
                    {
                        type: EffectType.Choice,
                        label: 'Pay {2} to create a Pest?',
                        optional: true,
                        choices: [
                            {
                                label: 'Pay {2}',
                                costs: [{ type: 'Mana', value: "{2}" }],
                                effects: [
                                    {
                                        type: EffectType.CreateToken,
                                        targetMapping: 'CONTROLLER',
                                        amount: 1,
                                        tokenBlueprint: {
                                            name: "Pest",
                                            colors: ["black", "green"],
                                            types: ["Creature"],
                                            subtypes: ["Pest"],
                                            power: "1",
                                            toughness: "1",
                                            oracleText: "When this creature dies, you gain 1 life.",
                                            abilities: [
                                                {
                                                    id: "pest_death_trigger",
                                                    type: AbilityType.Triggered,
                                                    activeZone: ZoneRequirement.Battlefield,
                                                    triggerEvent: TriggerEvent.Death,
                                                    triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
                                                    effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "Lisette, Dean of the Root": {
        abilities: [
            {
                id: "lisette_life_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.LifeGain,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: 'Pay {1} to buff creatures?',
                        optional: true,
                        choices: [
                            {
                                label: "Pay {1}",
                                costs: [{ type: 'Mana', value: "{1}" }],
                                effects: [
                                    {
                                        type: EffectType.AddCounters,
                                        value: '+1/+1',
                                        amount: 1,
                                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                                    },
                                    {
                                        type: EffectType.ApplyContinuousEffect,
                                        abilitiesToAdd: ["Trample"],
                                        duration: DurationType.UntilEndOfTurn,
                                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "Selfless Glyphweaver": {
        abilities: [
            {
                id: "glyphweaver_exile",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Exile', targetMapping: 'SELF' }],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Indestructible"],
                        duration: DurationType.UntilEndOfTurn,
                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                    }
                ]
            }
        ]
    },
    "Deadly Vanity": {
        abilities: [
            {
                id: "deadly_vanity_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: ['Nonland', { type: 'AnyOf', values: ['Creature', 'Planeswalker'] }]
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: 'OTHER_CREATURES_AND_PLANESWALKERS'
                    }
                ]
            }
        ]
    },
    "Torrent Sculptor": {
        abilities: [
            {
                id: "torrent_sculptor_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.EnterBattlefield,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: 'Exile instant/sorcery for counters?',
                        optional: true,
                        choices: [
                            {
                                label: "Exile",
                                effects: [
                                    {
                                        type: EffectType.Exile,
                                        targetDefinition: { type: TargetType.Card, count: 1, restrictions: ['Graveyard', 'Instant_OR_Sorcery'] },
                                        onSelected: (card: any) => [
                                            {
                                                type: EffectType.AddCounters,
                                                value: "+1/+1",
                                                amount: card.manaValue || 0,
                                                targetMapping: 'SELF'
                                            }
                                        ]
                                    } as any
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "Flamethrower Sonata": {
        abilities: [
            {
                id: "sonata_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: 'Discard a card',
                        choices: [
                            {
                                label: 'Discard',
                                effects: [
                                    {
                                        type: EffectType.DiscardCards,
                                        amount: 1,
                                        onSelected: (card: any) => [
                                            {
                                                type: EffectType.DealDamage,
                                                amount: 2 + (card.manaValue || 0),
                                                targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: [{ type: 'AnyOf', values: ['Creature', 'Planeswalker'] }] }
                                            },
                                            {
                                                type: EffectType.DrawCards,
                                                amount: 1,
                                                condition: 'DISCARDED_IS_INSTANT_OR_SORCERY'
                                            }
                                        ]
                                    } as any
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "Plargg, Dean of Chaos": {
        abilities: [
            {
                id: "plargg_loot",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }, { type: 'Discard', value: 1 }],
                effects: [{ type: EffectType.DrawCards, amount: 1 }]
            }
        ]
    },
    "Augusta, Dean of Order": {
        abilities: [
            {
                id: "augusta_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        targetMapping: 'OTHER_TAPPED_CREATURES_YOU_CONTROL',
                        layer: 7
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        toughnessModifier: 1,
                        targetMapping: 'OTHER_UNTAPPED_CREATURES_YOU_CONTROL',
                        layer: 7
                    }
                ]
            },
            {
                id: "augusta_attack_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.Attack,
                effects: [{ type: EffectType.Untap, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },
    "Rowan, Scholar of Sparks": {
        abilities: [
            {
                id: "rowan_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.CostReduction,
                        amount: 1,
                        restrictions: [{ type: "CardType", value: "Instant" }, { type: "CardType", value: "Sorcery" }]
                    }
                ]
            },
            {
                id: "rowan_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "+1" }],
                effects: [{ type: EffectType.DealDamage, amount: 1, targetMapping: 'EACH_OPPONENT' }]
            },
            {
                id: "rowan_minus_4",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "-4" }],
                effects: [
                    { 
                        type: EffectType.CreateEmblem, 
                        emblemBlueprint: { 
                            name: "Rowan Emblem", 
                            oracleText: "Whenever you cast an instant or sorcery spell, you may copy it. You may choose new targets for the copy.",
                            abilities: [
                                {
                                    id: "rowan_emblem_trigger",
                                    type: AbilityType.Triggered,
                                    triggerEvent: TriggerEvent.CastInstantOrSorcery,
                                    effects: [{ type: EffectType.Choice, choices: [{ label: "Copy the spell?", effects: [{ type: EffectType.CopySpellOnStack, targetMapping: 'EVENT_TARGET' }] }] }]
                                }
                            ]
                        } 
                    }
                ]
            }
        ]
    },
    "Will, Scholar of Frost": {
        abilities: [
            {
                id: "will_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.CostReduction,
                        amount: 1,
                        restrictions: [{ type: "CardType", value: "Instant" }, { type: "CardType", value: "Sorcery" }]
                    }
                ]
            },
            {
                id: "will_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "+1" }],
                targetDefinition: { type: TargetType.Permanent, count: 2, optional: true, restrictions: ['Creature'] },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        restrictions: [{ type: "Restriction", value: "CANNOT_ATTACK_OR_BLOCK" }],
                        duration: { 
                            type: DurationType.UntilEvent, 
                            expiryEvent: 'ON_UPKEEP_STEP',
                            untilTurnOfPlayerId: (state: any, source: any) => source.controllerId 
                        },
                        targetMapping: 'TARGET_ALL'
                    }
                ]
            },
            {
                id: "will_minus_3",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "-3" }],
                effects: [{ type: EffectType.DrawCards, amount: 2 }]
            },
            {
                id: "will_minus_7",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "-7" }],
                effects: [
                    { 
                        type: EffectType.CreateEmblem, 
                        emblemBlueprint: { 
                            name: "Will Emblem", 
                            oracleText: "Whenever you cast an instant or sorcery spell, you may copy it. You may choose new targets for the copy.",
                            abilities: [
                                {
                                    id: "will_emblem_trigger",
                                    type: AbilityType.Triggered,
                                    triggerEvent: TriggerEvent.CastInstantOrSorcery,
                                    effects: [{ type: EffectType.Choice, choices: [{ label: "Copy the spell?", effects: [{ type: EffectType.CopySpellOnStack, targetMapping: 'EVENT_TARGET' }] }] }]
                                }
                            ]
                        } 
                    }
                ]
            }
        ]
    },
    "Mila, Crafty Companion": {
        abilities: [
            {
                id: "mila_defensive_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.Attack,
                triggerCondition: (state: any, event: any, source: any) => {
                    if (event.playerId === source.controllerId) return false;
                    const target = state.battlefield.find((o: any) => o.id === event.data?.targetId);
                    return target && target.definition.types.includes('Planeswalker') && target.controllerId === source.controllerId;
                },
                effects: [{ 
                    type: EffectType.AddCounters, 
                    value: 'loyalty', 
                    amount: 1, 
                    targetMapping: 'ALL_PLANESWALKERS_YOU_CONTROL' 
                }]
            },
            {
                id: "mila_draw_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.BecomeTarget,
                triggerCondition: (state: any, event: any, source: any) => {
                    const target = state.battlefield.find((o: any) => o.id === event.targetId);
                    return target && target.controllerId === source.controllerId && event.playerId !== source.controllerId;
                },
                effects: [{ type: EffectType.Choice, optional: true, choices: [{ label: "Draw a card", effects: [{ type: EffectType.DrawCards, amount: 1 }] }] }]
            }
        ]
    },
    "Lukka, Wayward Bonder": {
        abilities: [
            {
                id: "lukka_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "+1" }],
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Discard a card?",
                        optional: true,
                        choices: [{
                            label: "Discard",
                            effects: [{
                                type: EffectType.DiscardCards,
                                amount: 1,
                                onSelected: (card: any) => [
                                    {
                                        type: EffectType.DrawCards,
                                        amount: card.definition.types.includes('Creature') ? 2 : 1
                                    }
                                ]
                            }]
                        }]
                    }
                ]
            },
            {
                id: "lukka_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "-2" }],
                targetDefinition: { type: TargetType.Card, count: 1, restrictions: ['Creature', 'Graveyard'] },
                effects: [
                    { 
                        type: EffectType.PutOnBattlefield, 
                        targetMapping: 'TARGET_1' 
                    },
                    { 
                        type: EffectType.ApplyContinuousEffect, 
                        abilitiesToAdd: ['Haste'], 
                        duration: DurationType.UntilEndOfTurn,
                        targetMapping: 'TARGET_1'
                    },
                    { 
                        type: EffectType.CreateDelayedTrigger, 
                        triggerEvent: TriggerEvent.Upkeep, 
                        triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                        effects: [{ type: EffectType.Exile, targetMapping: 'TARGET_1' }] 
                    }
                ]
            },
            {
                id: "lukka_minus_7",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: "-7" }],
                effects: [{
                    type: EffectType.CreateEmblem,
                    emblemBlueprint: {
                        name: "Lukka Emblem",
                        oracleText: "Whenever a creature you control enters, it deals damage equal to its power to any target.",
                        abilities: [{
                            id: "lukka_emblem_trigger",
                            type: AbilityType.Triggered,
                            triggerEvent: TriggerEvent.EnterBattlefield,
                            triggerCondition: (state: any, event: any, source: any) => event.data?.object?.controllerId === source.controllerId && event.data?.object?.definition.types.includes('Creature'),
                            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
                            effects: [{ 
                                type: EffectType.DealDamage, 
                                amount: (state: any, source: any, targets: any, event: any) => event.data?.object?.power || 0,
                                targetMapping: 'TARGET_1' 
                            }]
                        }]
                    }
                }]
            }
        ]
    },
    "Extus, Oriq Overlord": {
        abilities: [
            {
                id: "extus_magecraft",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: TriggerEvent.Magecraft,
                targetDefinition: { type: TargetType.Card, count: 1, restrictions: ['Creature', 'Nonlegendary', 'Graveyard'] },
                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'TARGET_1' }]
            }
        ]
    },
    "Awaken the Blood Avatar": {
        abilities: [
            {
                id: "awaken_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: EffectType.Sacrifice, targetMapping: 'EACH_OPPONENT', restrictions: ['Creature'] },
                    { 
                        type: EffectType.CreateToken, 
                        amount: 1, 
                        tokenBlueprint: {
                            name: "Avatar",
                            power: "3",
                            toughness: "6",
                            colors: ["black", "red"],
                            types: ["Creature"],
                            subtypes: ["Avatar"],
                            keywords: ["Haste"],
                            oracleText: "Whenever this token attacks, it deals 3 damage to each opponent.",
                            abilities: [{
                                id: "avatar_attack_trigger",
                                type: AbilityType.Triggered,
                                triggerEvent: TriggerEvent.Attack,
                                triggerCondition: (state: any, event: any, source: any) => event.sourceId === source.sourceId,
                                effects: [{ type: EffectType.DealDamage, amount: 3, targetMapping: 'EACH_OPPONENT' }]
                            }]
                        }
                    }
                ]
            }
        ]
    }
};
