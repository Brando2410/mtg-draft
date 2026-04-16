import { AbilityType, CardDefinition, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const STX_Remaining_Lessons: CardDefinition[] = [
    {
        name: 'Teachings of the Archaics',
        manaCost: '{2}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: "If an opponent has more cards in hand than you, draw two cards. Otherwise, you may discard a card. If you do, draw two cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.Choice,
                        condition: 'OpponentHasMoreCardsInHand',
                        choices: [
                            { label: 'Draw two cards', effects: [{ type: EffectType.DrawCards, amount: 2 }] }
                        ],
                        onFailureEffects: [
                            {
                                type: EffectType.Choice,
                                label: 'Discard a card to draw two?',
                                optional: true,
                                choices: [{
                                    label: 'Discard & Draw',
                                    costs: [{ type: 'Discard', value: 1 }],
                                    effects: [{ type: EffectType.DrawCards, amount: 2 }]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Basic Conjuration',
        manaCost: '{1}{G}',
        colors: ['G'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. You gain 2 life.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.LookAtTopAndPick,
                        fromTop: 6,
                        optional: true,
                        restrictions: [Restriction.Creature],
                        reveal: true,
                        zone: Zone.Hand,
                        targetMapping: TargetMapping.Controller,
                        remainderZone: Zone.Library,
                        remainderPosition: 'bottom',
                        shuffleRemainder: true
                    },
                    { type: EffectType.GainLife, amount: 2 }
                ]
            }
        ]
    },
    {
        name: 'Illuminate History',
        manaCost: '{2}{R}{R}',
        colors: ['R'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Discard any number of cards, then draw that many cards. Create a 3/2 red and white Spirit creature token. Exile Illuminate History.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.DiscardCards, amount: 'ANY_NUMBER', label: 'Discard any number of cards' },
                    { type: EffectType.DrawCards, amount: 'DISCARDED_COUNT', targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'], image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ]
    },
    {
        name: 'Mercurial Transformation',
        manaCost: '{1}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Until end of turn, target nonland permanent loses all abilities and becomes a blue Frog creature with base power and toughness 1/1 or a blue Elemental creature with base power and toughness 4/4.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 1,
                    type: TargetType.NonlandPermanent
                },
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Frog (1/1) or Elemental (4/4)?",
                        choices: [
                            {
                                label: 'Frog (1/1)',
                                effects: [{
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilEndOfTurn },
                                    removeAllAbilities: true,
                                    colorSet: ['U'],
                                    typesSet: ['Creature'],
                                    subtypesSet: ['Frog'],
                                    powerSet: 1,
                                    toughnessSet: 1,
                                    targetMapping: TargetMapping.Target1
                                }]
                            },
                            {
                                label: 'Elemental (4/4)',
                                effects: [{
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilEndOfTurn },
                                    removeAllAbilities: true,
                                    colorSet: ['U'],
                                    typesSet: ['Creature'],
                                    subtypesSet: ['Elemental'],
                                    powerSet: 4,
                                    toughnessSet: 4,
                                    targetMapping: TargetMapping.Target1
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Confront the Past',
        manaCost: '{X}{B}',
        colors: ['B'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Choose one —\n• Return target planeswalker card with mana value X or less from your graveyard to the battlefield.\n• Exile target planeswalker with mana value X or less.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Return or Exile?",
                        choices: [
                            {
                                label: "Return from Graveyard",
                                targetDefinition: {
                                    type: TargetType.CardInGraveyard,
                                    count: 1,
                                    restrictions: ['Planeswalker', { type: 'ManaValueLessEqualX' }]
                                },
                                effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }]
                            },
                            {
                                label: "Exile from Battlefield",
                                targetDefinition: {
                                    count: 1,
                                    type: TargetType.Planeswalker,
                                    restrictions: [{ type: 'ManaValueLessEqualX' }]
                                },
                                effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Mascot Exhibition',
        manaCost: '{7}',
        colors: [],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: "Create a 2/1 white and black Inkling creature token with flying, a 3/2 red and white Spirit creature token, and a 4/4 blue and red Elemental creature token.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Inkling', power: "2", toughness: "1", keywords: ['Flying'], colors: ['W', 'B'], types: ['Creature', 'Token'], subtypes: ['Inkling'], image_url: 'https://cards.scryfall.io/large/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.jpg?1682693898' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'], image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Elemental', power: "4", toughness: "4", colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'], image_url: 'https://cards.scryfall.io/large/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.jpg?1682693891' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    }
                ]
            }
        ]
    }
];

