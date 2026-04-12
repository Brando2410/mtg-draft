import { ImplementableCard, AbilityType, Zone, EffectType, TargetType, TriggerEvent, ZoneRequirement, DurationType } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH A7: ELDER DRAGONS & COMMANDS
 */

const TREASURE_BLUEPRINT = {
    name: 'Treasure',
    types: ['Artifact'],
    subtypes: ['Treasure'],
    colors: [],
    oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
    abilities: [
        {
            id: 'treasure_mana',
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: 'Tap' }, { type: 'Sacrifice', restrictions: ['SELF'] }],
            effects: [{ type: EffectType.AddMana, value: '{ANY}' }]
        }
    ]
};

const PEST_BLUEPRINT = {
    name: 'Pest',
    power: "1",
    toughness: "1",
    colors: ['black', 'green'],
    types: ['Creature'],
    subtypes: ['Pest'],
    oracleText: 'When this creature dies, you gain 1 life.',
    abilities: [{
        id: 'pest_death_trigger',
        type: AbilityType.Triggered,
        triggerEvent: TriggerEvent.Death,
        triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
        activeZone: ZoneRequirement.Battlefield,
        effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
    }]
};

const INKLING_BLUEPRINT = {
    name: 'Inkling',
    power: "2",
    toughness: "1",
    colors: ['white'],
    types: ['Creature'],
    subtypes: ['Inkling'],
    keywords: ['Flying']
};

const SPIRIT_BLUEPRINT = {
    name: 'Spirit',
    power: "3",
    toughness: "2",
    colors: ['red', 'white'],
    types: ['Creature'],
    subtypes: ['Spirit']
};

// --- ELDER DRAGONS ---

export const GalazethPrismari: ImplementableCard = {
    name: 'Galazeth Prismari',
    manaCost: '{2}{U}{R}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '3',
    toughness: '4',
    keywords: ['Flying'],
    colors: ['blue', 'red'],
    oracleText: 'Flying\nWhen Galazeth Prismari enters the battlefield, create a Treasure token.\nArtifacts you control have "{T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell."',
    abilities: [
        {
            id: 'galazeth_etb',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.EnterBattlefield,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{ type: EffectType.CreateToken, amount: 1, tokenBlueprint: TREASURE_BLUEPRINT }]
        },
        {
            id: 'galazeth_grant_mana',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Artifact'],
                    abilitiesToAdd: [
                        {
                            id: 'granted_galazeth_mana',
                            type: AbilityType.Activated,
                            isManaAbility: true,
                            costs: [{ type: 'Tap' }],
                            effects: [{ 
                                type: EffectType.AddMana, 
                                value: '{ANY}', 
                                restrictions: ['Instant', 'Sorcery'] 
                            }]
                        }
                    ]
                }
            ]
        }
    ]
};

export const BeledrosWitherbloom: ImplementableCard = {
    name: 'Beledros Witherbloom',
    manaCost: '{5}{B}{G}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '4',
    toughness: '4',
    keywords: ['Flying'],
    colors: ['black', 'green'],
    oracleText: 'Flying\nAt the beginning of each upkeep, create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."\nPay 10 life: Untap all lands you control. Activate only once each turn.',
    abilities: [
        {
            id: 'beledros_upkeep',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Upkeep,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{ type: EffectType.CreateToken, amount: 1, tokenBlueprint: PEST_BLUEPRINT }]
        },
        {
            id: 'beledros_untap',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'PayLife', value: 10 }],
            limitPerTurn: 1,
            effects: [{ type: EffectType.Untap, targetMapping: 'ALL_LANDS_YOU_CONTROL' }]
        }
    ]
};

export const ShadrixSilverquill: ImplementableCard = {
    name: 'Shadrix Silverquill',
    manaCost: '{3}{W}{B}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '2',
    toughness: '5',
    keywords: ['Flying', 'Double strike'],
    colors: ['white', 'black'],
    oracleText: 'Flying, double strike\nAt the beginning of combat on your turn, choose an opponent. You and that player each choose a different mode. Each mode must target a different player.\n• Target player creates a 2/1 white Inkling creature token with flying.\n• Target player draws a card and loses 1 life.\n• Target player puts a +1/+1 counter on each creature they control.',
    abilities: [
        {
            id: 'shadrix_combat',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.BeginningOfCombatStep,
            activeZone: ZoneRequirement.Battlefield,
            triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                {
                    label: "Create a 2/1 Inkling",
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [{ type: EffectType.CreateToken, amount: 1, tokenBlueprint: INKLING_BLUEPRINT, targetMapping: 'TARGET_1' }]
                },
                {
                    label: "Draw 1 card and lose 1 life",
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [
                        { type: EffectType.DrawCards, amount: 1, targetMapping: 'TARGET_1' },
                        { type: EffectType.LoseLife, amount: 1, targetMapping: 'TARGET_1' }
                    ]
                },
                {
                    label: "Each creature gets a +1/+1 counter",
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [{ 
                        type: EffectType.AddCounters, 
                        value: '+1/+1', 
                        amount: 1, 
                        targetMapping: 'ALL_CREATURES_CONTROLLED_BY_TARGET_1' 
                    }]
                }
            ],
            restrictions: [{ type: 'DifferentPlayerTargets' }]
        }
    ]
};

export const TanazirQuandrix: ImplementableCard = {
    name: 'Tanazir Quandrix',
    manaCost: '{3}{G}{G}{U}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '4',
    toughness: '4',
    keywords: ['Flying', 'Trample'],
    colors: ['green', 'blue'],
    oracleText: 'Flying, trample\nWhen Tanazir Quandrix enters the battlefield, double the number of +1/+1 counters on target creature you control.\nWhenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become Tanazir Quandrix\'s power and toughness until end of turn.',
    abilities: [
        {
            id: 'tanazir_etb',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.EnterBattlefield,
            activeZone: ZoneRequirement.Battlefield,
            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature', 'YouControl'] },
            effects: [{ 
                type: EffectType.AddCounters, 
                value: '+1/+1', 
                amount: 'TARGET_COUNTERS_COUNT',
                targetMapping: 'TARGET_1' 
            }]
        },
        {
            id: 'tanazir_attack',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Attack,
            activeZone: ZoneRequirement.Battlefield,
            optional: true,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: DurationType.UntilEndOfTurn,
                layer: 7,
                powerSet: 'SOURCE_POWER',
                toughnessSet: 'SOURCE_TOUGHNESS',
                targetMapping: 'OTHER_CREATURES_YOU_CONTROL'
            }]
        }
    ]
};

export const VelomachusLorehold: ImplementableCard = {
    name: 'Velomachus Lorehold',
    manaCost: '{5}{R}{W}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '5',
    toughness: '5',
    keywords: ['Flying', 'Vigilance', 'Haste'],
    colors: ['red', 'white'],
    oracleText: 'Flying, vigilance, haste\nWhenever Velomachus Lorehold attacks, look at the top seven cards of your library. You may cast an instant or sorcery spell with mana value less than or equal to Velomachus Lorehold\'s power from among them without paying its mana cost. Put the rest on the bottom of your library in a random order.',
    abilities: [
        {
            id: 'velomachus_attack',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.Attack,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{
                type: EffectType.LookAtTopAndPick,
                fromTop: 7,
                restrictions: ['Instant', 'Sorcery', 'mv_le_source_power'],
                isFreeCast: true,
                shuffleRemainder: true,
                remainderPosition: 'bottom'
            }]
        }
    ]
};

// --- COMMANDS ---

export const PrismariCommand: ImplementableCard = {
    name: 'Prismari Command',
    manaCost: '{1}{U}{R}',
    type_line: 'Instant',
    types: ['Instant'],
    colors: ['blue', 'red'],
    oracleText: 'Choose two —\n• Prismari Command deals 2 damage to any target.\n• Target player draws two cards, then discards two cards.\n• Create a Treasure token.\n• Destroy target artifact.',
    abilities: [
        {
            id: 'prismari_command_modal',
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                { 
                    label: 'Deal 2 damage to any target', 
                    targetDefinition: { type: TargetType.AnyTarget, count: 1 },
                    effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Target player draws 2, discards 2', 
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [
                        { type: EffectType.DrawCards, amount: 2, targetMapping: 'TARGET_1' }, 
                        { type: EffectType.DiscardCards, amount: 2, targetMapping: 'TARGET_1' }
                    ] 
                },
                { 
                    label: 'Create a Treasure token', 
                    effects: [{ type: EffectType.CreateToken, amount: 1, tokenBlueprint: TREASURE_BLUEPRINT }] 
                },
                { 
                    label: 'Destroy target artifact', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Artifact'] },
                    effects: [{ type: EffectType.Destroy, targetMapping: 'TARGET_1' }] 
                }
            ]
        }
    ]
};

export const WitherbloomCommand: ImplementableCard = {
    name: 'Witherbloom Command',
    manaCost: '{B}{G}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    colors: ['black', 'green'],
    oracleText: 'Choose two —\n• Target player mills three cards, then you return a land card from your graveyard to your hand.\n• Destroy target noncreature, nonland permanent with mana value 2 or less.\n• Target creature gets -3/-1 until end of turn.\n• Target opponent loses 2 life and you gain 2 life.',
    abilities: [
        {
            id: 'witherbloom_command_modal',
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                { 
                    label: 'Mill 3, return land', 
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [
                        { type: EffectType.Mill, amount: 3, targetMapping: 'TARGET_1' },
                        { 
                            type: EffectType.LookAtTopAndPick, 
                            label: 'Return land from graveyard', 
                            fromZone: Zone.Graveyard,
                            targetDefinition: { type: TargetType.Card, count: 1, restrictions: ['Land'] },
                            destination: Zone.Hand
                        }
                    ] 
                },
                { 
                    label: 'Destroy permanent (MV <= 2)', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Noncreature', 'Nonland', 'mv_le_2'] },
                    effects: [{ type: EffectType.Destroy, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Target creature gets -3/-1', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature'] },
                    effects: [{ type: EffectType.ApplyContinuousEffect, duration: DurationType.UntilEndOfTurn, powerModifier: -3, toughnessModifier: -1, layer: 7, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Opponent loses 2, you gain 2', 
                    targetDefinition: { type: TargetType.Player, count: 1, restrictions: ['Opponent'] },
                    effects: [
                        { type: EffectType.LoseLife, amount: 2, targetMapping: 'TARGET_1' }, 
                        { type: EffectType.GainLife, amount: 2, targetMapping: 'CONTROLLER' }
                    ] 
                }
            ]
        }
    ]
};

export const SilverquillCommand: ImplementableCard = {
    name: 'Silverquill Command',
    manaCost: '{2}{W}{B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    colors: ['white', 'black'],
    oracleText: 'Choose two —\n• Target creature gets +3/+3 and gains vigilance until end of turn.\n• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n• Target player draws a card and loses 1 life.\n• Target opponent sacrifices a creature.',
    abilities: [
        {
            id: 'silverquill_command_modal',
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                { 
                    label: 'Creature gets +3/+3 and vigilance', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature'] },
                    effects: [{ type: EffectType.ApplyContinuousEffect, duration: DurationType.UntilEndOfTurn, powerModifier: 3, toughnessModifier: 3, layer: 7, abilitiesToAdd: ['Vigilance'], targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Return creature (MV <= 2)', 
                    targetDefinition: { type: TargetType.Card, count: 1, restrictions: ['Creature', 'Graveyard', 'mv_le_2'] },
                    effects: [{ type: EffectType.PutOnBattlefield, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Player draws 1, loses 1', 
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [
                        { type: EffectType.DrawCards, amount: 1, targetMapping: 'TARGET_1' }, 
                        { type: EffectType.LoseLife, amount: 1, targetMapping: 'TARGET_1' }
                    ] 
                },
                { 
                    label: 'Opponent sacrifices a creature', 
                    targetDefinition: { type: TargetType.Player, count: 1, restrictions: ['Opponent'] },
                    effects: [{ type: EffectType.Sacrifice, targetMapping: 'TARGET_1', restrictions: ['Creature'] }] 
                }
            ]
        }
    ]
};

export const QuandrixCommand: ImplementableCard = {
    name: 'Quandrix Command',
    manaCost: '{1}{G}{U}',
    type_line: 'Instant',
    types: ['Instant'],
    colors: ['green', 'blue'],
    oracleText: 'Choose two —\n• Return target creature or planeswalker to its owner\'s hand.\n• Counter target artifact or enchantment spell.\n• Put two +1/+1 counters on target creature.\n• Target player shuffles up to three target cards from their graveyard into their library.',
    abilities: [
        {
            id: 'quandrix_command_modal',
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                { 
                    label: 'Bounce creature/planeswalker', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature_OR_Planeswalker'] },
                    effects: [{ type: EffectType.ReturnToHand, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Counter artifact/enchantment spell', 
                    targetDefinition: { type: TargetType.Spell, count: 1, restrictions: ['Artifact_OR_Enchantment'] },
                    effects: [{ type: EffectType.Counter, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Two +1/+1 counters', 
                    targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['Creature'] },
                    effects: [{ type: EffectType.AddCounters, value: '+1/+1', amount: 2, targetMapping: 'TARGET_1' }] 
                },
                { 
                    label: 'Shuffle cards into library', 
                    targetDefinition: { type: TargetType.Card, count: 3, minCount: 0, restrictions: ['Graveyard'] },
                    effects: [{ 
                        type: EffectType.MoveToZone, 
                        zone: Zone.Library, 
                        libraryPosition: 'top', 
                        shuffle: true, 
                        targetMapping: 'TARGET_ALL'
                    }] 
                }
            ]
        }
    ]
};

export const LoreholdCommand: ImplementableCard = {
    name: 'Lorehold Command',
    manaCost: '{3}{R}{W}',
    type_line: 'Instant',
    types: ['Instant'],
    colors: ['red', 'white'],
    oracleText: 'Choose two —\n• Create a 3/2 red and white Spirit creature token.\n• Creatures you control get +1/+0 and gain indestructible and haste until end of turn.\n• Lorehold Command deals 3 damage to any target and you gain 3 life.\n• Target player sacrifices a permanent and draws two cards.',
    abilities: [
        {
            id: 'lorehold_command_modal',
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 2,
            maxChoices: 2,
            modes: [
                { 
                    label: 'Create 3/2 Spirit', 
                    effects: [{ type: EffectType.CreateToken, amount: 1, tokenBlueprint: SPIRIT_BLUEPRINT }] 
                },
                { 
                    label: 'Creatures get +1/+0, indestructible, haste', 
                    effects: [{ type: EffectType.ApplyContinuousEffect, duration: DurationType.UntilEndOfTurn, powerModifier: 1, layer: 7, abilitiesToAdd: ['Indestructible', 'Haste'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }] 
                },
                { 
                    label: 'Deal 3 damage, gain 3 life', 
                    targetDefinition: { type: TargetType.AnyTarget, count: 1 },
                    effects: [
                        { type: EffectType.DealDamage, amount: 3, targetMapping: 'TARGET_1' }, 
                        { type: EffectType.GainLife, amount: 3, targetMapping: 'CONTROLLER' }
                    ] 
                },
                { 
                    label: 'Player sacrifices permanent, draws 2', 
                    targetDefinition: { type: TargetType.Player, count: 1 },
                    effects: [
                        { type: EffectType.Sacrifice, targetMapping: 'TARGET_1', restrictions: ['Permanent'] }, 
                        { type: EffectType.DrawCards, amount: 2, targetMapping: 'TARGET_1' }
                    ] 
                }
            ]
        }
    ]
};
