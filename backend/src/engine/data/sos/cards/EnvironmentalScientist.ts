import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetMapping } from '@shared/engine_types';

export const EnvironmentalScientist: CardDefinition = {
    "name": "Environmental Scientist",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Druid"
    ],
    "oracleText": "When this creature enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            optional: true,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: TargetMapping.Controller,
                    restrictions: [{ type: 'Type', value: 'Land' }, { type: 'Subtype', value: 'Basic' }],
                    destination: Zone.Hand,
                    reveal: true,
                    shuffle: true
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};



