import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
                    targetDefinitions: [{ count: 1, type: TargetType.Creature }],
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
                    targetDefinitions: [{
                        count: 1,
                        type: TargetType.CardInGraveyard,
                        restrictions: [Restriction.Creature, Restriction.ManaValue2OrLess]
                    }],
                    effects: [{
                        type: EffectType.MoveToZone,
                        zone: Zone.Battlefield,
                        targetMapping: TargetMapping.Target1
                    }]
                },
                {
                    label: 'Player draws 1, loses 1',
                    targetDefinitions: [{ count: 1, type: TargetType.Player }],
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
                    targetDefinitions: [{ count: 1, type: TargetType.Opponent }],
                    effects: [{
                        type: EffectType.Sacrifice,
                        targetMapping: TargetMapping.Target1,
                        restrictions: [Restriction.Creature]
                    }]
                }
            ]
        }]
    }],
    scryfall_id: "5c55f533-9d31-4ad1-b336-927aba6e74d6",
    image_url: "https://cards.scryfall.io/normal/front/5/c/5c55f533-9d31-4ad1-b336-927aba6e74d6.jpg?1624740020",
    rarity: "rare"
};

