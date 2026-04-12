import { 
    CardDefinition, 
    AbilityType, 
    EffectType, 
    TriggerEvent, 
    Zone, 
    ActionType,
    TargetType,
    ImplementableCard
} from '@shared/engine_types';

export const STX_BATCH_3: Record<string, ImplementableCard> = {
    "Academic Probation": {
        name: "Academic Probation",
        manaCost: "{1}{W}",
        type_line: 'Sorcery',
        types: ["Sorcery"],
        subtypes: [],
        supertypes: [],
        colors: ['white'],
        keywords: [],
        oracleText: "Choose a nonland card name. Until your next turn, spells with the chosen name can't be cast and permanents with the chosen name can't attack or block.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
        abilities: [
            {
                id: 'academic_probation',
                type: AbilityType.Spell,
                activeZone: 'Stack',
                effects: [
                    { 
                        type: EffectType.Choice,
                        label: "Name a nonland card",
                        targetIdMapping: 'NAME_A_CARD',
                        restrictions: ['Nonland'],
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            duration: 'UNTIL_YOUR_NEXT_TURN',
                            restrictions: ['CantCastNamedCard', 'CantAttackOrBlockNamedCard'],
                            layer: 6 // Ability/Restriction layer
                        }]
                    },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },

    "Double Major": {
        name: "Double Major",
        manaCost: "{G}{U}",
        type_line: 'Instant',
        types: ["Instant"],
        subtypes: [],
        supertypes: [],
        colors: ['green', 'blue'],
        keywords: [],
        oracleText: "Copy target creature spell you control, except the copy isn't legendary if the spell was legendary.",
        abilities: [
            {
                id: 'double_major',
                type: AbilityType.Spell,
                activeZone: 'Stack',
                targetDefinition: {
                    type: TargetType.Spell,
                    count: 1,
                    restrictions: ['Creature', 'YouControl']
                },
                effects: [{
                    type: EffectType.CopySpellOnStack,
                    targetMapping: 'TARGET_1',
                    isLegendary: false 
                }]
            }
        ]
    },

    "Ecological Appreciation": {
        name: "Ecological Appreciation",
        manaCost: "{X}{G}{G}{G}",
        type_line: 'Sorcery',
        types: ["Sorcery"],
        subtypes: [],
        supertypes: [],
        colors: ['green'],
        keywords: [],
        oracleText: "Search your library and graveyard for up to four creature cards with different names that each have mana value X or less and reveal them. An opponent chooses two of those cards. Shuffle the chosen cards into your library and put the rest onto the battlefield. Exile Ecological Appreciation.",
        abilities: [
            {
                id: 'ecological_appreciation',
                type: AbilityType.Spell,
                activeZone: 'Stack',
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        label: "Search for 4 creatures with different names",
                        sourceZones: [Zone.Library, Zone.Graveyard],
                        amount: 4,
                        restrictions: ['Creature', 'DifferentNames', 'mv_le_x'],
                        next: {
                            type: EffectType.Choice,
                            label: "Opponent chooses two to shuffle back",
                            playerIdMapping: 'OPPONENT',
                            targetMapping: 'LOOKING_CARDS',
                            minChoices: 2,
                            maxChoices: 2,
                            effects: [
                                { type: EffectType.MoveToZone, zone: Zone.Library, shuffle: true, targetMapping: 'SELECTED_CARDS' },
                                { type: EffectType.PutOnBattlefield, targetMapping: 'REMAINING_LOOKING_CARDS' }
                            ]
                        }
                    },
                    { type: EffectType.Exile, targetMapping: 'SELF' }
                ]
            }
        ]
    },

    "Exponential Growth": {
        name: "Exponential Growth",
        manaCost: "{X}{X}{R}{G}",
        type_line: 'Sorcery',
        types: ["Sorcery"],
        subtypes: [],
        supertypes: [],
        colors: ['red', 'green'],
        keywords: [],
        oracleText: "Until end of turn, double target creature's power X times.",
        abilities: [
            {
                id: 'exponential_growth',
                type: AbilityType.Spell,
                activeZone: 'Stack',
                targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature'] },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    layer: 7,
                    powerMultiplier: '2_POW_X', 
                    targetMapping: 'TARGET_1'
                }]
            }
        ]
    },

    "Gnarled Professor": {
        name: "Gnarled Professor",
        manaCost: "{2}{G}{G}",
        type_line: 'Creature — Treefolk Druid',
        types: ["Creature"],
        subtypes: ["Treefolk", "Druid"],
        supertypes: [],
        power: "5",
        toughness: "4",
        colors: ["green"],
        keywords: ["Trample"],
        oracleText: "Trample\nWhen Gnarled Professor enters the battlefield, learn.",
        abilities: [
            {
                id: 'gnarled_professor_etb',
                type: AbilityType.Triggered,
                triggerEvent: TriggerEvent.EnterBattlefield,
                activeZone: 'Battlefield',
                effects: [{ type: EffectType.Learn }]
            }
        ]
    },

    "Harness Infinity": {
        name: "Harness Infinity",
        manaCost: "{1}{B}{B}{B}{B}{B}{G}{G}",
        type_line: 'Sorcery',
        types: ["Sorcery"],
        subtypes: [],
        supertypes: [],
        colors: ['black', 'green'],
        keywords: [],
        oracleText: "Exchange your hand and graveyard. Exile Harness Infinity.",
        abilities: [
            {
                id: 'harness_infinity',
                type: AbilityType.Spell,
                activeZone: 'Stack',
                effects: [
                    { type: EffectType.ExchangeHandAndGraveyard, targetMapping: 'CONTROLLER' },
                    { type: EffectType.Exile, targetMapping: 'SELF' }
                ]
            }
        ]
    }
};
