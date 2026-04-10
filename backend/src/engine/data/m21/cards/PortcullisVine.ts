import { AbilityType, ZoneRequirement, ImplementableCard, EffectType } from "@shared/engine_types";

export const PortcullisVine: Record<string, ImplementableCard> = {
    "Portcullis Vine": {
        name: "Portcullis Vine",
        manaCost: "{G}",
        oracleText: "Defender\n{2}, {T}, Sacrifice a creature with defender: Draw a card.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Plant", "Wall"],
        power: "0",
        toughness: "3",
        keywords: ["Defender"],
        abilities: [
            {
                id: "portcullis_vine_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{2}' },
                    { type: 'Tap' },
                    { 
                        type: 'Sacrifice', 
                        restrictions: ['Creature', 'Defender']
                    }
                ],
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 1,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};
