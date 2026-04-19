import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SilverquillCommand: CardDefinition = {
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
                    targetDefinition: { count: 1, type: TargetType.Creature },
                    effects: [{
                        type: EffectType.ApplyContinuousEffect,
                        duration: { type: DurationType.UntilEndOfTurn },
                        powerModifier: 3,
                        toughnessModifier: 3,
                        abilitiesToAdd: ['Vigilance'],
                        targetMapping: TargetMapping.Target1
                    }]
                },
                {
                    label: 'Return creature (MV <= 2)',
                    targetDefinition: {
                        count: 1,
                        type: TargetType.CardInGraveyard,
                        restrictions: ['creature', 'mv <= 2']
                    },
                    effects: [{
                        type: EffectType.MoveToZone,
                        zone: Zone.Battlefield,
                        targetMapping: TargetMapping.Target1
                    }]
                },
                {
                    label: 'Player draws 1, loses 1',
                    targetDefinition: { count: 1, type: TargetType.Player },
                    effects: [{
                        type: EffectType.DrawCards,
                        amount: 1,
                        targetMapping: TargetMapping.Target1
                    }, {
                        type: EffectType.LoseLife,
                        amount: 1,
                        targetMapping: TargetMapping.Target1
                    }]
                },
                {
                    label: 'Opponent sacrifices a creature',
                    targetDefinition: { count: 1, type: TargetType.Opponent },
                    effects: [{
                        type: EffectType.Sacrifice,
                        targetMapping: TargetMapping.Target1,
                        restrictions: ['creature']
                    }]
                }
            ]
        }]
    }]
};

