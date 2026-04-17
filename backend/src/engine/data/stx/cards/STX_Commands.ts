import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const STX_Commands: CardDefinition[] = [
    {
        name: 'Prismari Command',
        manaCost: '{1}{U}{R}',
        colors: ['U', 'R'],
        types: ['Instant'],
        oracleText: 'Choose two —\n• Prismari Command deals 2 damage to any target.\n• Target player draws two cards, then discards two cards.\n• Create a Treasure token.\n• Destroy target artifact.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Deal 2 damage to any target', 
                        targetDefinition: { count: 1, type: TargetType.AnyTarget },
                        effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Target player draws 2, discards 2', 
                        targetDefinition: { count: 1, type: TargetType.Player },
                        effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 }, { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Create a Treasure token', 
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Treasure', colors: [], types: ['Artifact', 'Token'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' } }] 
                    },
                    { 
                        label: 'Destroy target artifact', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Artifact' }] },
                        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }] 
                    }
                ]
            }]
        }]
    },
    {
        name: 'Witherbloom Command',
        manaCost: '{B}{G}',
        colors: ['B', 'G'],
        types: ['Sorcery'],
        oracleText: 'Choose two —\n• Target player mills three cards, then you return a land card from your graveyard to your hand.\n• Destroy target noncreature, nonland permanent with mana value 2 or less.\n• Target creature gets -3/-1 until end of turn.\n• Target opponent loses 2 life and you gain 2 life.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Mill 3, return land', 
                        targetDefinition: { count: 1, type: TargetType.Player },
                        effects: [{ type: EffectType.Mill, amount: 3, targetMapping: TargetMapping.Target1 }, { type: EffectType.LookAtTopAndPick, fromZone: Zone.Graveyard, restrictions: [
                { type: 'Type', value: 'Land' }
            ], zone: Zone.Hand }] 
                    },
                    { 
                        label: 'Destroy permanent (MV <= 2)', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [
                { type: 'Not',
                restriction: { type: 'Type',
                value: 'Creature' } },
                { type: 'Not',
                restriction: { type: 'Type',
                value: 'Land' } },
                { type: 'Attribute',
                attribute: 'ManaValue',
                value: 2,
                comparison: 'LE' }
            ] },
                        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Target creature gets -3/-1', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [
                { type: 'Type',
                value: 'Creature' }
            ] },
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: -3, toughnessModifier: -1, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Opponent loses 2, you gain 2', 
                        targetDefinition: { count: 1, type: TargetType.Player, restrictions: [
                { type: 'Control', value: 'Opponent' }
            ] },
                        effects: [{ type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.Target1 }, { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }] 
                    }
                ]
            }]
        }]
    },
    {
        name: 'Silverquill Command',
        manaCost: '{2}{W}{B}',
        colors: ['W', 'B'],
        types: ['Sorcery'],
        oracleText: 'Choose two —\n• Target creature gets +3/+3 and gains vigilance until end of turn.\n• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n• Target player draws a card and loses 1 life.\n• Target opponent sacrifices a creature.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Creature gets +3/+3 and vigilance', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [
                { type: 'Type',
                value: 'Creature' }
            ] },
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: 3, toughnessModifier: 3, abilitiesToAdd: ['Vigilance'], targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Return creature (MV <= 2)', 
                        targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Type', value: 'mv<=2' }
            ] },
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Player draws 1, loses 1', 
                        targetDefinition: { count: 1, type: TargetType.Player },
                        effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1 }, { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Opponent sacrifices a creature', 
                        targetDefinition: { count: 1, type: TargetType.Player, restrictions: [
                { type: 'Control', value: 'Opponent' }
            ] },
                        effects: [{ type: EffectType.Sacrifice, targetMapping: TargetMapping.Target1, restriction: 'Creature' }] 
                    }
                ]
            }]
        }]
    },
    {
        name: 'Quandrix Command',
        manaCost: '{1}{G}{U}',
        colors: ['G', 'U'],
        types: ['Instant'],
        oracleText: 'Choose two —\n• Return target creature or planeswalker to owner\'s hand.\n• Counter target artifact or enchantment spell.\n• Put two +1/+1 counters on target creature.\n• Target player shuffles up to three target cards from graveyard into library.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Bounce creature/planeswalker', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [
                { type: 'Any',
                restrictions: [{ type: 'Type',
                value: 'Creature' },
                { type: 'Type',
                value: 'Planeswalker' }
            ] }] },
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Counter artifact/enchantment spell', 
                        targetDefinition: { count: 1, type: TargetType.Spell, restrictions: [
                { type: 'Any',
                restrictions: [{ type: 'Type',
                value: 'Artifact' },
                { type: 'Type',
                value: 'Enchantment' }
            ] }] },
                        effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Two +1/+1 counters', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [
                { type: 'Type',
                value: 'Creature' }
            ] },
                        effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 2, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Shuffle cards into library', 
                        targetDefinition: { type: TargetType.CardInGraveyard, count: 3, optional: true },
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, libraryPosition: 'top', shuffle: true, targetMapping: TargetMapping.TargetAll }] 
                    }
                ]
            }]
        }]
    },
    {
        name: 'Lorehold Command',
        manaCost: '{3}{R}{W}',
        colors: ['R', 'W'],
        types: ['Instant'],
        oracleText: 'Choose two —\n• Create a 3/2 red and white Spirit creature token.\n• Creatures you control get +1/+0 and gain indestructible and haste until end of turn.\n• Lorehold Command deals 3 damage to any target and you gain 3 life.\n• Target player sacrifices a permanent and draws two cards.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Create 3/2 Spirit', 
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'] } }] 
                    },
                    { 
                        label: 'Creatures get +1/+0, indestructible, haste', 
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: 1, abilitiesToAdd: ['Indestructible', 'Haste'], targetMapping: TargetMapping.AllCreaturesYouControl }] 
                    },
                    { 
                        label: 'Deal 3 damage, gain 3 life', 
                        targetDefinition: { count: 1, type: TargetType.AnyTarget },
                        effects: [{ type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 }, { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller }] 
                    },
                    { 
                        label: 'Player sacrifices permanent, draws 2', 
                        targetDefinition: { count: 1, type: TargetType.Player },
                        effects: [{ type: EffectType.Sacrifice, targetMapping: TargetMapping.Target1, restriction: 'Permanent' }, { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 }] 
                    }
                ]
            }]
        }]
    }
];

