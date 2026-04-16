import { AbilityType, CardDefinition, DurationType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Batch_10: CardDefinition[] = [
    {
        name: "Academic Probation",
        manaCost: "{1}{W}",
        colors: ['W'],
        types: ["Sorcery"],
        subtypes: ["Lesson"],
        oracleText: "Choose a nonland card name. Until your next turn, spells with the chosen name can't be cast and permanents with the chosen name can't attack or block.\nLearn.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Name a nonland card",
                        targetIdMapping: TargetMapping.NameACard,
                        targetDefinition: { type: TargetType.NonlandPermanent, count: 1 },
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            duration: { type: DurationType.UntilYourNextTurn },
                            // The engine interprets these based on the chosen name in NameACard mapping
                            effects: [{ type: 'CantCastNamedCard' }, { type: 'CantAttackOrBlockNamedCard' }]
                        }]
                    },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },
    {
        name: "Double Major",
        manaCost: "{G}{U}",
        colors: ['G', 'U'],
        types: ["Instant"],
        oracleText: "Copy target creature spell you control, except the copy isn't legendary if the spell was legendary.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Spell,
                    count: 1,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{
                    type: EffectType.CopySpellOnStack,
                    targetMapping: TargetMapping.Target1,
                    isLegendary: false
                }]
            }
        ]
    },
    {
        name: "Ecological Appreciation",
        manaCost: "{X}{G}{G}{G}",
        colors: ['G'],
        types: ["Sorcery"],
        oracleText: "Search your library and graveyard for up to four creature cards with different names that each have mana value X or less and reveal them. An opponent chooses two of those cards. Shuffle the chosen cards into your library and put the rest onto the battlefield. Exile Ecological Appreciation.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        label: "Search for 4 creatures with different names",
                        zone: Zone.Hand, // Temporary zone for choice
                        amount: 4,
                        restrictions: [
                            { type: 'Type', value: 'Creature' },
                            { type: 'DifferentNames' },
                            { type: 'Attribute', attribute: 'ManaValue', value: DynamicAmount.X, comparison: 'LE' }
                        ],
                        reveal: true,
                        next: {
                            type: EffectType.Choice,
                            label: "Opponent chooses two to shuffle back",
                            playerIdMapping: TargetMapping.TargetOpponent,
                            targetIdMapping: TargetMapping.SelectedCards,
                            minChoices: 2,
                            maxChoices: 2,
                            effects: [
                                { type: EffectType.MoveToZone, zone: Zone.Library, shuffle: true, targetMapping: TargetMapping.SelectedCards },
                                { type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.RemainingLookingCards }
                            ]
                        }
                    },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ]
    },
    {
        name: "Exponential Growth",
        manaCost: "{X}{X}{R}{G}",
        colors: ['R', 'G'],
        types: ["Sorcery"],
        oracleText: "Until end of turn, double target creature's power X times.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: TargetType.Creature, count: 1 },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    // The engine would need a custom handler for 2^X
                    effects: [{ type: 'DoublePowerXTimes', amount: DynamicAmount.X }],
                    targetMapping: TargetMapping.Target1
                }]
            }
        ]
    },
    {
        name: "Gnarled Professor",
        manaCost: "{2}{G}{G}",
        colors: ["G"],
        types: ["Creature"],
        subtypes: ["Treefolk", "Druid"],
        power: "5",
        toughness: "4",
        keywords: ["Trample"],
        oracleText: "Trample\nWhen Gnarled Professor enters the battlefield, learn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.Learn }]
            }
        ]
    },
    {
        name: "Harness Infinity",
        manaCost: "{1}{B}{B}{B}{B}{B}{G}{G}",
        colors: ['B', 'G'],
        types: ["Sorcery"],
        oracleText: "Exchange your hand and graveyard. Exile Harness Infinity.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: 'ExchangeHandAndGraveyard', targetMapping: TargetMapping.Controller },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ]
    }
];


