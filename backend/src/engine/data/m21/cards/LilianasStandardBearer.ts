import { AbilityType, EffectType, CardDefinition, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const LilianasStandardBearer: CardDefinition = {

    name: "Liliana's Standard Bearer",
    manaCost: "{2}{B}",
    oracleText: "Flash\nWhen Liliana's Standard Bearer enters the battlefield, draw X cards, where X is the number of creatures that died under your control this turn.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Zombie", "Knight"],
    power: "3",
    toughness: "1",
    keywords: ["Flash"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 'CREATURES_DIED_UNDER_YOUR_CONTROL_THIS_TURN_COUNT',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


