import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const IndulgingPatrician: Record<string, ImplementableCard> = {
    "Indulging Patrician": {
        name: "Indulging Patrician",
        manaCost: "{1}{W}{B}",
        oracleText: "Flying, lifelink\nAt the beginning of your end step, if you gained 3 or more life this turn, each opponent loses 3 life.",
        colors: ["white", "black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Vampire", "Knight"],
        power: "1",
        toughness: "4",
        keywords: ["Flying", "Lifelink"],
        abilities: [
            {
                id: "indulging_patrician_end_step",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: "ON_END_STEP",
                triggerCondition: (state: any, event: any, source: any) => {
                    const gained = state.turnState.lifeGainedThisTurn[source.controllerId] || 0;
                    return state.activePlayerId === source.controllerId && gained >= 3;
                },
                effects: [{
                    type: EffectType.LoseLife,
                    amount: 3,
                    targetMapping: "OPPONENT"
                }],
                oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, each opponent loses 3 life."
            }
        ]
    }
};
