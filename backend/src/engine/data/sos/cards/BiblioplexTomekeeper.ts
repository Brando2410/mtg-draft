import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BiblioplexTomekeeper: CardDefinition = {
    "name": "Biblioplex Tomekeeper",
    "manaCost": "{4}",
    "colors": [],
    "types": [
        "Artifact",
        "Creature"
    ],
    "subtypes": [
        "Construct"
    ],
    "oracleText": "When this creature enters, choose up to one —\n• Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)\n• Target creature becomes unprepared.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    choices: [
                        { 
                            label: 'Prepare a creature', 
                            effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Target1 }], 
                            targetDefinition: { type: TargetType.Creature } 
                        },
                        { 
                            label: 'Unprepare a creature', 
                            effects: [{ type: EffectType.Unprepare, targetMapping: TargetMapping.Target1 }], 
                            targetDefinition: { type: TargetType.Creature } 
                        }
                    ]
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "4"
};




