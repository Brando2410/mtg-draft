import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping } from '@shared/engine_types';

export const STX_Batch_13_Outliers: CardDefinition[] = [
    {
        name: 'Ageless Guardian',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Spirit', 'Soldier'],
        power: "1",
        toughness: "4",
        oracleText: '',
        abilities: []
    },
    {
        name: 'Archway Commons',
        manaCost: '',
        colors: [],
        types: ['Land'],
        entersTapped: true,
        oracleText: 'Archway Commons enters the battlefield tapped.\nWhen Archway Commons enters the battlefield, sacrifice it unless you pay {1}.\n{T}: Add one mana of any color.',
        abilities: [

            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{
                    type: EffectType.Choice,
                    label: "Pay {1} or sacrifice Archway Commons?",
                    choices: [
                        { label: "Pay {1}", costs: [{ type: 'Mana', value: '{1}' }] },
                        { label: "Sacrifice", effects: [{ type: EffectType.Sacrifice, targetMapping: TargetMapping.Self }] }
                    ]
                }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Tap' }],
                effects: [{
                    type: EffectType.Choice,
                    label: "Select color",
                    choices: [
                        { label: "{W}", effects: [{ type: EffectType.AddMana, value: 'W' }] },
                        { label: "{U}", effects: [{ type: EffectType.AddMana, value: 'U' }] },
                        { label: "{B}", effects: [{ type: EffectType.AddMana, value: 'B' }] },
                        { label: "{R}", effects: [{ type: EffectType.AddMana, value: 'R' }] },
                        { label: "{G}", effects: [{ type: EffectType.AddMana, value: 'G' }] }
                    ]
                }]
            }
        ]
    },
    {
        name: 'Arrogant Poet',
        manaCost: '{1}{B}',
        colors: ['B'],
        types: ['Creature'],
        subtypes: ['Human', 'Warlock'],
        power: "2",
        toughness: "1",
        oracleText: 'Whenever Arrogant Poet attacks, you may pay 2 life. If you do, it gains flying until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                condition: 'SelfAttacking',
                effects: [{
                    type: EffectType.Choice,
                    label: "Pay 2 life for flying?",
                    optional: true,
                    choices: [{
                        label: "Pay 2 Life",
                        costs: [{ type: 'Life', value: 2 }],
                        effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'] }]
                    }]
                }]
            }
        ]
    },
    {
        name: 'Beaming Defiance',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Instant'],
        oracleText: 'Target creature you control gets +2/+2 and gains hexproof until end of turn.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 2,
                    toughnessModifier: 2,
                    abilitiesToAdd: ['Hexproof']
                }]
            }
        ]
    },
    {
        name: 'Biblioplex Assistant',
        manaCost: '{4}',
        colors: [],
        types: ['Artifact', 'Creature'],
        subtypes: ['Construct'],
        power: "2",
        toughness: "1",
        keywords: ['Flying'],
        oracleText: 'Flying\nWhen Biblioplex Assistant enters the battlefield, you may put target instant or sorcery card from your graveyard on top of your library.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                targetDefinition: {
                    count: 1,
                    type: TargetType.CardInGraveyard,
                    restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{
                    type: EffectType.Choice,
                    label: "Put card on top of library?",
                    optional: true,
                    choices: [{
                        label: "Move to Top",
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, targetMapping: TargetMapping.Target1, libraryPosition: 'top' }]
                    }]
                }]
            }
        ]
    },
    {
        name: 'Big Play',
        manaCost: '{1}{G}',
        colors: ['G'],
        types: ['Instant'],
        oracleText: 'Target creature gets +2/+2 until end of turn. Put a +1/+1 counter on it.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }]
                },
                effects: [
                    { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 2 },
                    { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }
                ]
            }
        ]
    },
    {
        name: 'Blood Researcher',
        manaCost: '{1}{B}{G}',
        colors: ['B', 'G'],
        types: ['Creature'],
        subtypes: ['Vampire', 'Druid'],
        power: "2",
        toughness: "2",
        keywords: ['Menace'],
        oracleText: 'Menace\nWhenever you gain life, put a +1/+1 counter on Blood Researcher.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
                condition: 'YouGainedLife',
                effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Self }]
            }
        ]
    },
    {
        name: 'Combat Professor',
        manaCost: '{3}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Bird', 'Cleric'],
        power: "2",
        toughness: "3",
        keywords: ['Flying'],
        oracleText: 'Flying\nAt the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
                condition: 'IS_YOUR_TURN',
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    abilitiesToAdd: ['Vigilance']
                }]
            }
        ]
    },
    {
        name: 'Defend the Campus',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Instant'],
        oracleText: 'Choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Destroy target creature with power 4 or greater.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [{
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: "+1/+1 to your creatures",
                            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.AllCreaturesYouControl, duration: 'UNTIL_END_OF_TURN', powerModifier: 1, toughnessModifier: 1 }]
                        },
                        {
                            label: "Destroy target creature P>=4",
                            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Power', comparison: 'GreaterOrEqual', value: 4 }] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }]
            }
        ]
    },
    {
        name: 'Divide by Zero',
        manaCost: '{2}{U}',
        colors: ['U'],
        types: ['Instant'],
        oracleText: 'Return target spell or permanent with mana value 1 or greater to its owner\'s hand.\nLearn.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'ManaValue', comparison: 'GreaterOrEqual', value: 1 }]
                },
                effects: [
                    { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },
    {
        name: 'Dueling Coach',
        manaCost: '{3}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Human', 'Wizard'],
        power: "2",
        toughness: "2",
        oracleText: 'When Dueling Coach enters the battlefield, put a +1/+1 counter on target creature.\n{4}, {T}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Mana', value: '{4}' }, { type: 'Tap' }],
                effects: [{
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 1,
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [{ type: 'HasCounter', value: 'P1P1' }]
                }]
            }
        ]
    },
    {
        name: 'Eager First-Year',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Human', 'Wizard'],
        power: "2",
        toughness: "2",
        oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Eager First-Year gets +1/+0 until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', powerModifier: 1 }]
            }
        ]
    },
    {
        name: 'Essence Infusion',
        manaCost: '{1}{B}',
        colors: ['B'],
        types: ['Sorcery'],
        oracleText: 'Put two +1/+1 counters on target creature. It gains lifelink until end of turn.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [
                    { type: EffectType.AddCounters, counterType: 'P1P1', amount: 2, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'] }
                ]
            }
        ]
    },
    {
        name: 'Eureka Moment',
        manaCost: '{2}{G}{U}',
        colors: ['G', 'U'],
        types: ['Instant'],
        oracleText: 'Draw two cards. You may put a land card from your hand onto the battlefield.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.Choice,
                        label: "Put a land onto the battlefield?",
                        optional: true,
                        choices: [{
                            label: "Put Land",
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: 'CONTROLLER_HAND', restrictions: [{ type: 'Type', value: 'Land' }] }]
                        }]
                    }
                ]
            }
        ]
    },
    {
        name: 'Excavated Wall',
        manaCost: '{2}',
        colors: [],
        types: ['Artifact', 'Creature'],
        subtypes: ['Wall'],
        power: "0",
        toughness: "4",
        keywords: ['Defender'],
        oracleText: 'Defender',
        abilities: []
    },
    {
        name: 'Exhilarating Elocution',
        manaCost: '{2}{W}{B}',
        colors: ['W', 'B'],
        types: ['Sorcery'],
        oracleText: 'Put a +1/+1 counter on each creature you control.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.AllCreaturesYouControl }]
            }
        ]
    },
    {
        name: 'Expel',
        manaCost: '{2}{W}',
        colors: ['W'],
        types: ['Instant'],
        oracleText: 'Exile target tapped creature.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Tapped' }]
                },
                effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
            }
        ]
    },
    {
        name: 'First Day of Class',
        manaCost: '{1}{R}',
        colors: ['R'],
        types: ['Instant'],
        oracleText: 'Whenever a creature enters the battlefield under your control this turn, put a +1/+1 counter on it and it gains haste until end of turn.\nLearn.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        duration: 'UNTIL_END_OF_TURN',
                        deferredTrigger: {
                    eventMatch: TriggerEvent.EnterBattlefield,
                            condition: 'YouControlEnteredObject',
                            effects: [
                                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.TriggerEventSource },
                                { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.TriggerEventSource, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Haste'] }
                            ]
                        }
                    },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },
    {
        name: 'Flunk',
        manaCost: '{1}{B}',
        colors: ['B'],
        types: ['Instant'],
        oracleText: 'Target creature gets -X/-X until end of turn, where X is 7 minus the number of cards in its controller\'s hand.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 'TARGET_HAND_SIZE_7_MINUS',
                    toughnessModifier: 'TARGET_HAND_SIZE_7_MINUS'
                }]
            }
        ]
    },
    {
        name: 'Hall Monitor',
        manaCost: '{R}',
        colors: ['R'],
        types: ['Creature'],
        subtypes: ['Lizard', 'Wizard'],
        power: "1",
        toughness: "1",
        keywords: ['Haste'],
        oracleText: 'Haste\n{1}{R}, {T}: Target creature can\'t block this turn.',
        abilities: [
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Mana', value: '{1}{R}' }, { type: 'Tap' }],
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', cannotBlock: true }]
            }
        ]
    },
    {
        name: 'Infuse with Vitality',
        manaCost: '{B}{G}',
        colors: ['B', 'G'],
        types: ['Instant'],
        oracleText: 'Until end of turn, target creature gains deathtouch and "When this creature dies, return it to the battlefield tapped under its owner\'s control and you gain 2 life."',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Deathtouch'],
                    addedTriggers: [{
                    eventMatch: TriggerEvent.Death,
                        effects: [
                            { type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Self, libraryPosition: 'top', tapped: true },
                            { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
                        ]
                    }]
                }]
            }
        ]
    },
    {
        name: 'Lash of Malice',
        manaCost: '{B}',
        colors: ['B'],
        types: ['Instant'],
        oracleText: 'Target creature gets +2/-2 until end of turn.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: -2 }]
            }
        ]
    },
    {
        name: 'Leech Fanatic',
        manaCost: '{1}{B}',
        colors: ['B'],
        types: ['Creature'],
        subtypes: ['Human', 'Warlock'],
        power: "2",
        toughness: "2",
        oracleText: 'Whenever Leech Fanatic attacks, you may pay 2 life. If you do, it gains lifelink until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                condition: 'SelfAttacking',
                effects: [{
                    type: EffectType.Choice,
                    label: "Pay 2 life for lifelink?",
                    optional: true,
                    choices: [{
                        label: "Pay 2 Life",
                        costs: [{ type: 'Life', value: 2 }],
                        effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'] }]
                    }]
                }]
            }
        ]
    },
    {
        name: 'Mage Hunter',
        manaCost: '{3}{B}',
        colors: ['B'],
        types: ['Creature'],
        subtypes: ['Horror'],
        power: "3",
        toughness: "4",
        oracleText: 'Whenever an opponent casts or copies an instant or sorcery spell, they lose 1 life.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.MagecraftOpponent,
                effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.TriggerController }]
            }
        ]
    },
    {
        name: 'Manifestation Sage',
        manaCost: '{3}{G}{U}',
        colors: ['G', 'U'],
        types: ['Creature'],
        subtypes: ['Human', 'Wizard'],
        power: "2",
        toughness: "2",
        oracleText: 'When Manifestation Sage enters the battlefield, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of cards in your hand.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        power: "0",
                        toughness: "0",
                        colors: ['G', 'U'],
                        types: ['Creature', 'Token'],
                        subtypes: ['Fractal']
                    },
                    amount: 1,
                    startingCounters: { type: 'P1P1', amount: 'CARDS_IN_HAND_COUNT' }
                }]
            }
        ]
    },
    {
        name: 'Multiple Choice',
        manaCost: '{X}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        oracleText: 'If X is 1, return target creature to its owner\'s hand. If X is 2, create a 2/2 blue Drake creature token with flying. If X is 3, create a 4/4 blue and red Elemental creature token. If X is 4 or more, do all of the above and draw three cards.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [{
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: "X=1: Return Creature",
                            condition: 'XIs1',
                            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: "X=2: Create 2/2 Drake",
                            condition: 'XIs2',
                            effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Drake', power: '2', toughness: '2', colors: ['U'], types: ['Creature', 'Token'], subtypes: ['Drake'], keywords: ['Flying'] }, amount: 1 }]
                        },
                        {
                            label: "X=3: Create 4/4 Elemental",
                            condition: 'XIs3',
                            effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Elemental', power: '4', toughness: '4', colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'] }, amount: 1 }]
                        },
                        {
                            label: "X>=4: All Above + Draw 3",
                            condition: 'XIs4OrMore',
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    label: "Target creature to return hand (X>=4)",
                                    targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                                },
                                { type: EffectType.CreateToken, tokenBlueprint: { name: 'Drake', power: '2', toughness: '2', colors: ['U'], types: ['Creature', 'Token'], subtypes: ['Drake'], keywords: ['Flying'] }, amount: 1 },
                                { type: EffectType.CreateToken, tokenBlueprint: { name: 'Elemental', power: '4', toughness: '4', colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'] }, amount: 1 },
                                { type: EffectType.DrawCards, amount: 3, targetMapping: TargetMapping.Controller }
                            ]
                        }
                    ]
                }]
            }
        ]
    },
    {
        name: 'Pillardrop Rescuer',
        manaCost: '{4}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Spirit', 'Cleric'],
        power: "2",
        toughness: "2",
        keywords: ['Flying'],
        oracleText: 'Flying\nWhen Pillardrop Rescuer enters the battlefield, return target creature card with mana value 3 or less from your graveyard to your hand.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                targetDefinition: {
                    count: 1,
                    type: TargetType.CardInGraveyard,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'ManaValue', comparison: 'LessOrEqual', value: 3 }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
            }
        ]
    },
    {
        name: 'Practical Research',
        manaCost: '{3}{U}{R}',
        colors: ['U', 'R'],
        types: ['Instant'],
        oracleText: 'Draw four cards. Then discard two cards unless you discard an instant or sorcery card.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.DrawCards, amount: 4, targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.Choice,
                        label: "Discard option",
                        choices: [
                            { label: "Discard 1 Instant/Sorcery", effects: [{ type: EffectType.DiscardCards, amount: 1, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }] }] },
                            { label: "Discard 2 cards", effects: [{ type: EffectType.DiscardCards, amount: 2 }] }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'Reconstruct History',
        manaCost: '{2}{W}{R}',
        colors: ['W', 'R'],
        types: ['Sorcery'],
        oracleText: 'Return up to one target artifact card, up to one target enchantment card, up to one target instant card, up to one target sorcery card, and up to one target planeswalker card from your graveyard to your hand. Exile Reconstruct History.',
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    count: 5,
                    minCount: 0,
                    optional: true,
                    type: TargetType.CardInGraveyard,
                    perTargetRestrictions: [
                        [{ type: 'Type', value: 'Artifact' }],
                        [{ type: 'Type', value: 'Enchantment' }],
                        [{ type: 'Type', value: 'Instant' }],
                        [{ type: 'Type', value: 'Sorcery' }],
                        [{ type: 'Type', value: 'Planeswalker' }]
                    ]
                },
                effects: [
                    { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.TargetAll },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ]
    },
    {
        name: 'Spell Satchel',
        manaCost: '{2}',
        colors: [],
        types: ['Artifact'],
        oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a book counter on Spell Satchel.\n{T}, Remove a book counter from Spell Satchel: Add {C}.\n{3}, {T}, Remove three book counters from Spell Satchel: Draw a card.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [{ type: EffectType.AddCounters, counterType: 'book', amount: 1, targetMapping: TargetMapping.Self }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Tap' }, { type: 'RemoveCounter', counterType: 'book', amount: 1 }],
                effects: [{ type: EffectType.AddMana, amount: '{C}' }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Mana', value: '{3}' }, { type: 'Tap' }, { type: 'RemoveCounter', counterType: 'book', amount: 3 }],
                effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
            }
        ]
    },
    {
        name: 'Springmane Cervin',
        manaCost: '{2}{G}',
        colors: ['G'],
        types: ['Creature'],
        subtypes: ['Elk'],
        power: "3",
        toughness: "2",
        oracleText: 'When Springmane Cervin enters the battlefield, you gain 2 life.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }]
            }
        ]
    },
    {
        name: 'Stonerise Spirit',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Spirit', 'Bird'],
        power: "1",
        toughness: "2",
        keywords: ['Flying'],
        oracleText: 'Flying\n{4}, Exile Stonerise Spirit from your graveyard: Target creature gains flying until end of turn.',
        abilities: [
            {
                type: AbilityType.Activated,
                activeZone: Zone.Graveyard,
                costs: [{ type: 'Mana', value: '{4}' }, { type: 'Exile', targetMapping: TargetMapping.Self }],
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'] }]
            }
        ]
    },
    {
        name: 'Symmetry Sage',
        manaCost: '{U}',
        colors: ['U'],
        types: ['Creature'],
        subtypes: ['Human', 'Wizard'],
        power: "0",
        toughness: "2",
        keywords: ['Flying'],
        oracleText: 'Flying\nMagecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }] },
                effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', powerSet: 2 }]
            }
        ]
    }
];

