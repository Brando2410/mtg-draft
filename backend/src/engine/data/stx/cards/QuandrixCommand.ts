import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const QuandrixCommand: CardDefinition = {
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
                    targetDefinition: {
                        count: 1,
                        type: TargetType.Permanent,
                        restrictions: [Restriction.Creature, Restriction.Planeswalker]
                    },
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Counter artifact/enchantment spell',
                    targetDefinition: {
                        count: 1,
                        type: TargetType.Spell,
                        restrictions: [Restriction.Artifact, Restriction.Enchantment]
                    },
                    effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Two +1/+1 counters',
                    targetDefinition: { count: 1, type: TargetType.Creature },
                    effects: [{ type: EffectType.AddCounters, counterType: 'p1p1', amount: 2, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Shuffle cards into library',
                    targetDefinition: { count: 3, type: TargetType.Card, optional: true, restrictions: [Restriction.Graveyard] },
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, libraryPosition: 'top', shuffle: true, targetMapping: TargetMapping.TargetAll }]
                }
            ]
        }]
    }]
};

