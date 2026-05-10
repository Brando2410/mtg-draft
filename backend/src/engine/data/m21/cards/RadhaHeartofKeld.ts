import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping } from "@shared/engine_types";

export const RadhaHeartofKeld: CardDefinition = {
    name: "Radha, Heart of Keld",
    manaCost: "{1}{R}{G}",

    oracleText: "As long as it's your turn, Radha, Heart of Keld has first strike.\nYou may look at the top card of your library any time.\nYou may play lands from the top of your library.\n{4}{R}{G}: Radha gets +X/+X until end of turn, where X is the number of lands you control.",
    colors: ["R", "G"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Elf", "Warrior"],
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Static,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ["First Strike"],
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AllowLookAtTop,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AllowPlayFromTop,
                    restrictions: [Restriction.Land],
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{4}{R}{G}' }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: DynamicAmount.LandsYouControlCount,
                    toughnessModifier: DynamicAmount.LandsYouControlCount,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "2bbd37b1-49cb-4295-9a1f-fb85368a8f12",
    image_url: "https://cards.scryfall.io/normal/front/2/b/2bbd37b1-49cb-4295-9a1f-fb85368a8f12.jpg?1594737431",
    rarity: "rare"
};

