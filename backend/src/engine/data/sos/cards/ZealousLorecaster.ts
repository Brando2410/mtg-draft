import { AbilityType, CardDefinition, EffectType, TriggerEvent, TargetMapping, Zone, TargetType } from '@shared/engine_types';

export const ZealousLorecaster: CardDefinition = {
    "name": "Zealous Lorecaster",
    "manaCost": "{5}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Giant",
        "Sorcerer"
    ],
    "oracleText": "When this creature enters, return target instant or sorcery card from your graveyard to your hand.",
    "abilities": [
        {
            id: "zealous_lorecaster_etb",
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: ["Instant", "Sorcery"],
                zone: Zone.Graveyard
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "4"
};




