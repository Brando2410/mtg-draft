import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LifeGoesOn: Record<string, ImplementableCard> = {
    "Life Goes On": {
        name: "Life Goes On",
        manaCost: "{G}",
        oracleText: "You gain 4 life. If a creature died this turn, you gain 8 life instead.",
        colors: ["green"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "life_goes_on_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                effects: [{
                    type: EffectType.GainLife,
                    targetMapping: 'CONTROLLER',
                    amount: (state: any) => state.turnState.creaturesDiedThisTurn.length > 0 ? 8 : 4
                }]
            }
        ]
    }
};
