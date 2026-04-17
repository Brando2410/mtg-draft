import { AbilityType, Zone, EffectType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const LifeGoesOn: CardDefinition = {

    name: "Life Goes On",
    manaCost: "{G}",
    scryfall_id: "3888197f-5da4-4413-9cad-b37a12ba1e60",
    image_url: "https://cards.scryfall.io/normal/front/3/8/3888197f-5da4-4413-9cad-b37a12ba1e60.jpg?1594737084",
    oracleText: "You gain 4 life. If a creature died this turn, you gain 8 life instead.",
    colors: ["G"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            activeZone: Zone.Hand,
            effects: [{
                type: EffectType.GainLife,
                targetMapping: TargetMapping.Controller,
                amount: (state: any) => state.turnState.creaturesDiedThisTurn.length > 0 ? 8 : 4
            }]
        }
    ]

};
