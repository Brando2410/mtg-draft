import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from '@shared/engine_types';

export const Goremand: Record<string, ImplementableCard> = {
    "Goremand": {
        name: "Goremand",
        manaCost: "{4}{B}{B}",
        oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nFlying\nTrample\nWhen this creature enters, each opponent sacrifices a creature.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Demon"],
        power: "5",
        toughness: "5",
        keywords: ["Flying","Trample"],
        abilities: [
            {
                id: "goremand_sacrifice_cost",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Hand,
                effects: [{ type: EffectType.AdditionalCost, targetMapping: 'SELF', costs: [{ type: 'Sacrifice', restrictions: [Restriction.Creature] }] }]
            },
            {
                id: "goremand_etb_sacrifice",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: EffectType.Sacrifice, targetMapping: 'OPPONENT', restrictions: [Restriction.Creature] }]
            }
        ]
    }
};

