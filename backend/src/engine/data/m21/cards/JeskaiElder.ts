import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const JeskaiElder: Record<string, ImplementableCard> = {
    "Jeskai Elder": {
        name: "Jeskai Elder",
        manaCost: "{1}{U}",
        oracleText: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever Jeskai Elder deals combat damage to a player, you may draw a card. If you do, discard a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Monk"],
        power: "1",
        toughness: "2",
        keywords: ["Prowess"],
        abilities: [
            {
                id: "jeskai_elder_combat_damage",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: "ON_DAMAGE_PLAYER",
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.isCombat && event.sourceId === source.sourceId;
                },
                effects: [{
                    type: "Choice",
                    label: "Draw a card? If you do, discard a card.",
                    optional: true,
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                { type: EffectType.DrawCards, amount: 1, targetMapping: "CONTROLLER" },
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: "CONTROLLER" }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }],
                oracleText: "Whenever Jeskai Elder deals combat damage to a player, you may draw a card. If you do, discard a card."
            }
        ]
    }
};
