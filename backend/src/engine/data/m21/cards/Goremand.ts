import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Goremand: Record<string, ImplementableCard> = {
    "Goremand": {
        name: "Goremand",
        manaCost: "{4}{B}{B}",
        oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nFlying\nTrample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nWhen this creature enters, each opponent sacrifices a creature.",
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
                effects: [{ type: 'AdditionalCost', targetMapping: 'SELF', costs: [{ type: 'Sacrifice', restrictions: ['Creature'] }] }]
            },
            {
                id: "goremand_etb_sacrifice",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'Sacrifice', targetMapping: 'EACH_OPPONENT' }]
            }
        ]
    }
};
