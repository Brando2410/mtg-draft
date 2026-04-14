import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, TargetType } from '@shared/engine_types';

export const StrixhavenSkycoach: CardDefinition = {
    "name": "Strixhaven Skycoach",
    "manaCost": "{3}",
    "colors": [],
    "types": [
        "Artifact"
    ],
    "subtypes": [
        "Vehicle"
    ],
    "oracleText": "Flying\nWhen this Vehicle enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
    "keywords": ["Flying"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            optional: true,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    restrictions: ['BasicLand'],
                    reveal: true,
                    destination: Zone.Hand,
                    shuffle: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Crew', value: 2 }],
            effects: [
                {
                    type: EffectType.CREW,
                    targetMapping: TargetMapping.Self,
                    powerOverride: 3,
                    toughnessOverride: 2
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "2"
};
