import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FungalRebirth: Record<string, ImplementableCard> = {
    "Fungal Rebirth": {
        name: "Fungal Rebirth",
        manaCost: "{2}{G}",
        oracleText: "Return target permanent card from your graveyard to your hand. If a creature died this turn, create two 1/1 green Saproling creature tokens.",
        colors: ["green"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "fungal_rebirth_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Card,
                    count: 1,
                    restrictions: ["permanent", "graveyard", "yours"]
                },
                effects: [
                    {
                        type: EffectType.ReturnToHand,
                        targetMapping: "TARGET_1"
                    },
                    {
                        type: EffectType.CreateToken,
                        condition: "CREATURE_DIED_THIS_TURN",
                        amount: 2,
                        tokenBlueprint: {
                            name: "Saproling",
                            colors: ["green"],
                            types: ["Creature"],
                            subtypes: ["Saproling"],
                            power: "1",
                            toughness: "1"
                        },
                        targetMapping: "CONTROLLER"
                    }
                ],
                oracleText: "Return target permanent card from your graveyard to your hand. If a creature died this turn, create two 1/1 green Saproling creature tokens."
            }
        ]
    }
};
