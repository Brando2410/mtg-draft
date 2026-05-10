import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const QuandrixCommand: CardDefinition = {
    name: 'Quandrix Command',
    manaCost: '{1}{G}{U}',
    colors: ['G', 'U'],
    types: ['Instant'],
    oracleText: "Choose two —\n• Return target creature or planeswalker to owner's hand.\n• Counter target artifact or enchantment spell.\n• Put two +1/+1 counters on target creature.\n• Target player shuffles up to three target cards from graveyard into library.",
    abilities: [{
        type: AbilityType.Spell,
        minChoices: 2,
        maxChoices: 2,
        modes: [
            {
                label: "Return target creature or planeswalker to owner's hand",
                targetDefinitions: [{
                    count: 1,
                    type: TargetType.CreatureOrPlaneswalker
                }],
                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
            },
            {
                label: 'Counter artifact/enchantment spell',
                targetDefinitions: [{
                    count: 1,
                    type: TargetType.Spell,
                    restrictions: [Restriction.ArtifactOrEnchantment]
                }],
                effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
            },
            {
                label: 'Put two +1/+1 counters on target creature',
                targetDefinitions: [{ count: 1, type: TargetType.Creature }],
                effects: [{ type: EffectType.AddCounters, counterType: 'p1p1', amount: 2, targetMapping: TargetMapping.Target1 }]
            },
            {
                label: 'Target player shuffles up to three target cards from their graveyard into their library',
                targetDefinitions: [
                    {
                        type: TargetType.Player,
                        count: 1
                    },
                    {
                        type: TargetType.CardInGraveyard,
                        count: 3,
                        minCount: 0,
                        optional: true,
                        restrictions: [Restriction.OwnedByTarget1],
                        label: 'Choose up to three target cards from their graveyard'
                    }
                ],
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        zone: Zone.Library,
                        position: 'top',
                        targetMapping: TargetMapping.TargetAll
                    },
                    {
                        type: EffectType.Shuffle,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }],
    scryfall_id: "b673dfb7-e384-4586-8326-ae6f23edfe78",
    image_url: "https://cards.scryfall.io/normal/front/b/6/b673dfb7-e384-4586-8326-ae6f23edfe78.jpg?1775941874",
    rarity: "rare"
};

