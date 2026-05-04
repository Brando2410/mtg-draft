import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const RambunctiousMutt: CardDefinition = {
    name: "Rambunctious Mutt",
    manaCost: "{3}{W}{W}",
    scryfall_id: "3f602ecc-c264-4f3e-adeb-d0186668653e",
    image_url: "https://cards.scryfall.io/normal/front/3/f/3f602ecc-c264-4f3e-adeb-d0186668653e.jpg?1599435086",
    oracleText: "When this creature enters, destroy target artifact or enchantment an opponent controls.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Dog"],
    power: "3",
    toughness: "4",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.ArtifactOrEnchantment,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
