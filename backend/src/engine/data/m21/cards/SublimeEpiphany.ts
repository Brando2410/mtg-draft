import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const SublimeEpiphany: CardDefinition = {
    name: "Sublime Epiphany",
    manaCost: "{4}{U}{U}",
    oracleText: "Choose one or more —\n• Counter target spell.\n• Counter target activated or triggered ability.\n• Return target nonland permanent to its owner's hand.\n• Create a token that's a copy of target creature you control.\n• Target player draws a card.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            multiMode: { type: 'CHOOSE_ONE_OR_MORE' },
            modes: [
                {
                    label: 'Counter target spell',
                    targetDefinitions: [{ type: TargetType.Spell, count: 1 }],
                    effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Counter target activated or triggered ability',
                    targetDefinitions: [{
                        type: TargetType.AnyTarget,
                        count: 1,
                        restrictions: [Restriction.Ability]
                    }],
                    effects: [{ type: EffectType.CounterAbility, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Return target nonland permanent to owner hand',
                    targetDefinitions: [{ type: TargetType.NonlandPermanent, count: 1 }],
                    effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Create token copy of target creature',
                    targetDefinitions: [{
                        type: TargetType.Creature,
                        count: 1,
                        restrictions: [Restriction.YouControl]
                    }],
                    effects: [{ type: EffectType.CreateTokenCopy, sourceMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Target player draws a card',
                    targetDefinitions: [{ type: TargetType.Player, count: 1 }],
                    effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ],
    scryfall_id: "0f7d3839-0bc3-402b-b9ea-c903f82d39da",
    image_url: "https://cards.scryfall.io/normal/front/0/f/0f7d3839-0bc3-402b-b9ea-c903f82d39da.jpg?1743206406",
    rarity: "rare"
};

