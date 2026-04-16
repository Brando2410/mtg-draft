import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_3: CardDefinition[] = [
    {
        name: "Codie, Vociferous Codex",
        manaCost: "{3}",
        colors: [],
        supertypes: ["Legendary"],
        types: ["Artifact", "Creature"],
        subtypes: ["Construct"],
        power: "1",
        toughness: "4",
        oracleText: "You can't cast permanent spells.\n{4}, {T}: Add {W}{U}{B}{R}{G}. When you cast your next spell this turn, exile cards from the top of your library until you exile an instant or sorcery card with mana value less than that spell's mana value. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
        abilities: [
            {
                type: AbilityType.Static,
                effects: [{ type: EffectType.CombatConstraint, restrictions: [{ type: 'CannotCastPermanentSpells' }] }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Mana', value: '{4}' }, { type: 'Tap', targetMapping: TargetMapping.Self }],
                effects: [
                    { type: EffectType.AddMana, manaType: 'WUBRG', amount: 5 },
                    { 
                        type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastSpell,
                        duration: 'UNTIL_END_OF_TURN',
                        condition: "NextSpellThisTurn",
                        effects: [{
                            type: EffectType.SearchLibrary,
                            fromTop: -1, // Search until found
                            restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }, { type: 'ManaValueLessThanSource' }],
                            zone: Zone.Exile,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom',
                            shuffleRemainder: true,
                            effects: [{
                                type: EffectType.Choice,
                                label: 'Cast revealed spell?',
                                optional: true,
                                choices: [{
                                    label: 'Cast',
                                    effects: [{ type: EffectType.CastSpell, targetMapping: TargetMapping.SelectedCard, isFreeCast: true }]
                                }]
                            }]
                        }]
                    }
                ]
            }
        ]
    },
    {
        name: "Academic Probation",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        subtypes: ["Lesson"],
        oracleText: "Choose one —\n• Choose a nonland card name. Until your next turn, target opponent can't cast spells with the chosen name.\n• Target creature can't block this turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [{
                    type: EffectType.Choice,
                    label: "Choose a mode",
                    choices: [
                        {
                            label: "Restriction",
                            targetDefinition: { count: 1, type: TargetType.Player, restrictions: [{ type: 'Opponent' }] },
                            effects: [
                                { type: EffectType.Choice, label: 'Choose a nonland card name', targetIdMapping: 'NAME_A_CARD', restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Land' } }] },
                                { 
                                    type: EffectType.ApplyContinuousEffect, 
                                    duration: 'UNTIL_YOUR_NEXT_TURN', 
                                    restrictions: [{ type: 'CannotCastNamedCard' }],
                                    targetMapping: TargetMapping.Target1 
                                }
                            ]
                        },
                        {
                            label: "Blocker",
                            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                            effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['CannotBlock'], targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }]
            }
        ]
    },
    {
        name: "Jadzi, Oracle of Arcavios",
        manaCost: "{6}{U}{U}",
        colors: ["U"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Wizard"],
        power: "5",
        toughness: "5",
        oracleText: "You may discard a card: Return Jadzi, Oracle of Arcavios to its owner's hand.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it's a nonland card, you may cast it by paying {1} rather than paying its mana cost. If it's a land card, put it onto the battlefield.",
        faces: [
            {
                name: "Jadzi, Oracle of Arcavios",
                manaCost: "{6}{U}{U}",
                colors: ["U"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Human", "Wizard"],
                power: "5",
                toughness: "5",
                oracleText: "You may discard a card: Return Jadzi, Oracle of Arcavios to its owner's hand.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it's a nonland card, you may cast it by paying {1} rather than paying its mana cost. If it's a land card, put it onto the battlefield.",
                abilities: [
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Discard', value: 1 }],
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Self }]
                    },
                    {
                        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                        effects: [{
                            type: EffectType.LookAtTopAndPick,
                            fromTop: 1,
                            optional: true,
                            effects: [
                                { type: EffectType.Choice, label: 'Cast for {1}?', choices: [{ label: 'Cast', effects: [{ type: EffectType.CastSpell, targetMapping: 'SELECTED_CARD', alternateCost: '{1}' }] }] }
                            ],
                            onFailureEffects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'SELECTED_CARD' }]
                        }]
                    }
                ]
            },
            {
                name: "Journey to the Oracle",
                manaCost: "{2}{G}{G}",
                colors: ["G"],
                supertypes: ["Legendary"],
                types: ["Sorcery"],
                oracleText: "Put any number of land cards from your hand onto the battlefield. Then if you control eight or more lands, you may discard a card. If you do, return Journey to the Oracle to its owner's hand.",
                abilities: [{
                    type: AbilityType.Spell,
                    effects: [
                        { type: EffectType.MoveToZone, zone: Zone.Battlefield, sourceZone: Zone.Hand, targetMapping: 'ANY_NUMBER_LANDS_FROM_HAND', restrictions: [{ type: 'Type', value: 'Land' }] },
                        {
                            type: EffectType.Choice,
                            label: "Discard and return to hand?",
                            condition: 'ControlEightOrMoreLands',
                            optional: true,
                            choices: [{
                                label: "Discard & Return",
                                costs: [{ type: 'Discard', value: 1 }],
                                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Self }]
                            }]
                        }
                    ]
                }]
            }
        ]
    },
    {
        name: "Harness Infinity",
        manaCost: "{1}{B}{B}{B}{G}{G}{G}",
        colors: ["B", "G"],
        types: ["Instant"],
        oracleText: "Exchange your hand and graveyard. Exile Harness Infinity.",
        abilities: [{
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.ExchangeHandAndGraveyard, targetMapping: TargetMapping.Controller },
                { type: EffectType.Exile, targetMapping: TargetMapping.Self }
            ]
        }]
    },
    {
        name: "Culling Ritual",
        manaCost: "{2}{B}{G}",
        colors: ["B", "G"],
        types: ["Sorcery"],
        oracleText: "Destroy each nonland permanent with mana value 2 or less. Add {B} or {G} for each permanent destroyed this way.",
        abilities: [{
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.AllMatchingPermanents,
                    restrictions: [{ type: 'Nonland' }, { type: 'Attribute', attribute: 'ManaValue', value: 2, comparison: 'LE' }]
                },
                {
                    type: EffectType.Choice,
                    label: "Choose colors for each mana added",
                    effects: [{ type: EffectType.AddMana, manaType: 'BG', amount: DynamicAmount.DestroyedCount }]
                }
            ]
        }]
    },
    {
        name: "Double Major",
        manaCost: "{G}{U}",
        colors: ["G", "U"],
        types: ["Instant"],
        oracleText: "Copy target creature spell you control that isn't legendary, except the copy isn't legendary.",
        abilities: [{
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Spell, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }, { type: 'Not', restriction: { type: 'Legendary' } }] },
            effects: [{ type: EffectType.CopySpellOnStack, targetMapping: TargetMapping.Target1, removeLegendary: true }]
        }]
    },
    {
        name: "Strict Proctor",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Creature"],
        subtypes: ["Spirit", "Cleric"],
        power: "1",
        toughness: "3",
        keywords: ["Flying"],
        oracleText: "Flying\nWhenever a permanent entering the battlefield causes a triggered ability to trigger, counter that ability unless its controller pays {2}.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: 'ON_TRIGGER_QUEUED', 
                condition: "IsETBTrigger",
                effects: [{
                    type: EffectType.Choice,
                    label: "Strict Proctor: Pay {2} or counter ability?",
                    targetMapping: TargetMapping.TriggerController,
                    choices: [
                        { label: "Pay {2}", costs: [{ type: 'Mana', value: '{2}' }] },
                        { label: "Don't Pay", effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.TriggerEventSource }] }
                    ]
                }]
            }
        ]
    },
    {
        name: "Sparring Regimen",
        manaCost: "{2}{W}",
        colors: ["W"],
        types: ["Enchantment"],
        oracleText: "Whenever you attack, put a +1/+1 counter on target attacking creature you control and untap it. Then learn.",
        abilities: [{
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            condition: "OnYourAttack",
            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Attacking' }, { type: 'Source', value: 'CONTROLLER' }] },
            effects: [
                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Untap, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Learn }
            ]
        }]
    }
];



