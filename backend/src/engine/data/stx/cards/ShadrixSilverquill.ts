import { AbilityType, CardDefinition, ConditionType, CounterType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const ShadrixSilverquill: CardDefinition = {
    name: "Shadrix Silverquill",
    manaCost: "{3}{W}{B}",
    colors: ["W", "B"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "2",
    toughness: "5",
    keywords: ["Flying", "Double Strike"],
    oracleText: "Flying, double strike. At the beginning of combat on your turn, choose two. Each mode must target a different player.\n• Target player creates a 2/1 white and black Inkling creature token with flying.\n• Target player draws a card and loses 1 life.\n• Target player puts a +1/+1 counter on each creature they control.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            effects: [{
                type: EffectType.Choice,
                label: "Choose two modes (must different targets)",
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    {
                        label: "Create Inkling",
                        targetDefinitions: [{ count: 1, type: TargetType.Player }],
                        effects: [{ type: EffectType.CreateToken, targetMapping: TargetMapping.Target1, tokenBlueprint: { name: 'Inkling', power: "2", toughness: "1", keywords: ['Flying'], colors: ['W', 'B'], types: ['Creature', 'Token'], subtypes: ['Inkling'] } }]
                    },
                    {
                        label: "Draw & Lose Life",
                        targetDefinitions: [{ count: 1, type: TargetType.Player }],
                        effects: [
                            { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1 },
                            { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Target1 }
                        ]
                    },
                    {
                        label: "Counters on all creatures",
                        targetDefinitions: [{ count: 1, type: TargetType.Player }],
                        effects: [{
                            type: EffectType.AddCounters,
                            counterType: CounterType.P1P1,
                            amount: 1,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [Restriction.Creature, Restriction.ControlledByTarget1]
                        }]
                    }
                ]
            }]
        }
    ],
    scryfall_id: "214a695b-208e-4fd5-9ceb-23c882eadcf7",
    image_url: "https://cards.scryfall.io/normal/front/2/1/214a695b-208e-4fd5-9ceb-23c882eadcf7.jpg?1775941913",
    rarity: "mythic"
};

