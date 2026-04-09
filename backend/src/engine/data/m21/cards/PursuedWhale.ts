import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const PursuedWhale: Record<string, ImplementableCard> = {
    "Pursued Whale": {
        name: "Pursued Whale",
        manaCost: "{5}{U}{U}",
        oracleText: "When this creature enters, each opponent creates a 1/1 red Pirate creature token with \"This creature can't block\" and \"Creatures you control attack each combat if able.\" Spells your opponents cast that target this creature cost {3} more to cast.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Whale"],
        power: "8",
        toughness: "8",
        keywords: [],
        abilities: [
            {
                id: "pursued_whale_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                effects: [{
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Pirate',
                        power: '1',
                        toughness: '1',
                        colors: ['R'],
                        types: ['Creature'],
                        subtypes: ['Pirate'],
                        keywords: ['Cant Block'],
                        oracleText: "This creature can't block. Creatures you control attack each combat if able."
                    },
                    targetMapping: 'EACH_OPPONENT'
                }]
            },
            {
                id: "pursued_whale_tax",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'SpellTax' as any,
                    amount: 3,
                    restrictions: ['TargetingSelf'],
                    targetMapping: 'EACH_OPPONENT'
                }]
            }
        ]
    }
};
