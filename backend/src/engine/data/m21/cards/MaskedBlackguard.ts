import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from "@shared/engine_types";

export const MaskedBlackguard: CardDefinition = {

    name: "Masked Blackguard",
    manaCost: "{1}{B}",
    scryfall_id: "d61b4b71-3cbb-4422-8ce7-657ca3bb6a82",
    image_url: "https://cards.scryfall.io/normal/front/d/6/d61b4b71-3cbb-4422-8ce7-657ca3bb6a82.jpg?1594736285",
    oracleText: "Flash (You may cast this spell any time you could cast an instant.)\n{2}{B}: This creature gets +1/+1 until end of turn.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Rogue"],
    power: "2",
    toughness: "1",
    keywords: ["Flash"],
    abilities: [
        {

            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}{B}' }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ],
        }
    ]

};

