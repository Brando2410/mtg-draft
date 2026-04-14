import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from "@shared/engine_types";

export const LilianasStandardBearer: Record<string, ImplementableCard> = {
    "Liliana's Standard Bearer": {
        name: "Liliana's Standard Bearer",
        manaCost: "{2}{B}",
        oracleText: "Flash\nWhen Liliana's Standard Bearer enters the battlefield, draw X cards, where X is the number of creatures that died under your control this turn.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie", "Knight"],
        power: "3",
        toughness: "1",
        keywords: ["Flash"],
        abilities: [
            {
                id: "lilianas_standard_bearer_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: 'ON_ETB',
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 'CREATURES_DIED_UNDER_YOUR_CONTROL_THIS_TURN_COUNT',
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};


