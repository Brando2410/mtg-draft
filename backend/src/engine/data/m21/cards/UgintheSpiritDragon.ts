import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const UgintheSpiritDragon: Record<string, ImplementableCard> = {
    "Ugin, the Spirit Dragon": {
        name: "Ugin, the Spirit Dragon",
        manaCost: "{8}",
        oracleText: "+2: Ugin, the Spirit Dragon deals 3 damage to any target.\n−X: Exile each permanent with mana value X or less that's one or more colors.\n−10: You gain 7 life, draw seven cards, then put up to seven permanent cards from your hand onto the battlefield.",
        colors: [],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Ugin"],
        power: "",
        toughness: "",
        keywords: [],
        loyalty: "7",
        abilities: [
            {
                id: "ugin_plus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+2' }],
                targetDefinition: { type: 'Permanent', count: 1, optional: false }, // Simplified target definition
                effects: [
                    { type: EffectType.DealDamage, amount: 3, targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "ugin_minus_x",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-X' }],
                effects: [
                    { type: EffectType.Choice, message: "Exile each permanent with mana value X or less that's one or more colors." }
                ]
            },
            {
                id: "ugin_minus_10",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-10' }],
                effects: [
                    { type: EffectType.GainLife, amount: 7, targetMapping: 'CONTROLLER' },
                    { type: EffectType.DrawCards, amount: 7, targetMapping: 'CONTROLLER' },
                    { type: EffectType.Choice, message: "Put up to seven permanent cards from your hand onto the battlefield." }
                ]
            }
        ]
    }
};
