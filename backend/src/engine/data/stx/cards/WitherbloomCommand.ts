import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const WitherbloomCommand: CardDefinition = {
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
                        effects: [{ type: EffectType.Mill, amount: 3, targetMapping: TargetMapping.Target1 }, { type: EffectType.LookAtTopAndPick, fromZone: Zone.Graveyard, restrictions: [{ type: 'Type', value: 'Land' }], destination: Zone.Hand }] 
                    },
                    { 
                        label: 'Destroy permanent (MV <= 2)', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Creature' } }, { type: 'Not', restriction: { type: 'Type', value: 'Land' } }, { type: 'Attribute', attribute: 'ManaValue', value: 2, comparison: 'LE' }] },
                        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Target creature gets -3/-1', 
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: -3, toughnessModifier: -1, targetMapping: TargetMapping.Target1 }] 
                    },
                    { 
                        label: 'Opponent loses 2, you gain 2', 
                        targetDefinition: { count: 1, type: TargetType.Player, restrictions: [{ type: 'Opponent' }] },
                        effects: [{ type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.Target1 }, { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }] 
                    }
                ]
            }]
        }]
    };
