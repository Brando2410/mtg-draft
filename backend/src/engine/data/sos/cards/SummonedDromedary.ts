import { AbilityType, CardDefinition, EffectType, SelectionType, TargetMapping, Zone } from '@shared/engine_types';

export const SummonedDromedary: CardDefinition = {
    "name": "Summoned Dromedary",
    "manaCost": "{3}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Spirit",
        "Camel"
    ],
    "oracleText": "Vigilance\n{1}{W}: Return this card from your graveyard to your hand. Activate only as a sorcery.",
    "keywords": ["Vigilance"],
    "abilities": [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [{ type: 'Mana', value: '{1}{W}' }],
            activatedOnlyAsSorcery: true,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "3"
};



