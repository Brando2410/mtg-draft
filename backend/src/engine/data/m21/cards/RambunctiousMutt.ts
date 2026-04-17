import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const RambunctiousMutt: CardDefinition = {

    name: "Rambunctious Mutt",
    manaCost: "{3}{W}{W}",
    oracleText: "When this creature enters, destroy target artifact or enchantment an opponent controls.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dog"],
    power: "3",
    toughness: "4",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.ArtifactOrEnchantment, count: 1, restrictions: [
                { type: 'Control', value: 'OpponentControl' }
            ] },
            effects: [{
                type: EffectType.Destroy,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]

};



