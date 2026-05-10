import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GadraktheCrownScourge: CardDefinition = {
    name: "Gadrak, the Crown-Scourge",
    manaCost: "{2}{R}",
    oracleText: "Flying\nGadrak, the Crown-Scourge can't attack unless you control four or more artifacts.\nAt the beginning of your end step, create a Treasure token for each nontoken creature that died this turn. (It's an artifact with \"{T}, Sacrifice this artifact: Add one mana of any color.\")",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Dragon"],
    power: "5",
    toughness: "4",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    restrictionsToAdd: [{ type: 'CannotAttack', condition: '!HAS_ARTIFACTS_4_OR_MORE_YOU_CONTROL' }],
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Treasure',
                        colors: [],
                        types: ['Artifact'],
                        subtypes: ['Treasure'],

                        abilities: [{
                            type: AbilityType.Activated,
                            costs: [{ type: CostType.Tap }, { type: CostType.SacrificeSelf }],
                            effects: [{ type: EffectType.AddMana, manaType: 'ANY' }]
                        }]
                    },
                    amount: 'NONTOKEN_CREATURES_DIED_THIS_TURN_COUNT',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "249bf4b2-9239-4303-9c5d-81d06f6b7fb1",
    image_url: "https://cards.scryfall.io/normal/front/2/4/249bf4b2-9239-4303-9c5d-81d06f6b7fb1.jpg?1743206671",
    rarity: "rare"
};

