import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent, ConditionType } from '@shared/engine_types';

export const GhostlyPilferer: CardDefinition = {
    name: "Ghostly Pilferer",
    manaCost: "{1}{U}",
    scryfall_id: "2810631f-c55c-4947-a26f-4d3ce76024b3",
    image_url: "https://cards.scryfall.io/normal/front/2/8/2810631f-c55c-4947-a26f-4d3ce76024b3.jpg?1594735508",
    oracleText: "Whenever this creature becomes untapped, you may pay {2}. If you do, draw a card.\nWhenever an opponent casts a spell from anywhere other than their hand, draw a card.\nDiscard a card: This creature can't be blocked this turn.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Spirit", "Rogue"],
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Untap,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "You may pay {2} to draw a card",
                    optional: true,
                    costs: [{ type: CostType.Mana, amount: 2 }],
                    effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'OPPONENT_CAST_FROM_NON_HAND_ZONE',
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Discard, amount: 1 }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    isUnblockable: true,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
