import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const StirringHonormancer: CardDefinition = {
    "name": "Stirring Honormancer",
    "manaCost": "{2}{W}{W/B}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Rhino",
        "Bard"
    ],
    "oracleText": "When this creature enters, look at the top X cards of your library, where X is the number of creatures you control. Put one of those cards into your hand and the rest into your graveyard.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a card to put into your hand",
                    choices: [
                        {
                            label: "Put 1 card into hand and the rest into graveyard",
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    fromTop: 'CREATURE_COUNT_YOU_CONTROL' as any,
                                    zone: Zone.Hand,
                                    count: 1,
                                    targetMapping: TargetMapping.Target1,
                                    remainderZone: Zone.Graveyard
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "5"
};




