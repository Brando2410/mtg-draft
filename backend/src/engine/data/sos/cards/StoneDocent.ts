import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, ZoneRequirement } from '@shared/engine_types';

export const StoneDocent: CardDefinition = {
    "name": "Stone Docent",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Spirit",
        "Chimera"
    ],
    "oracleText": "{W}, Exile this card from your graveyard: You gain 2 life. Surveil 1. Activate only as a sorcery. (Look at the top card of your library. You may put it into your graveyard.)",
    "abilities": [
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: 'Mana', value: '{W}' },
                { type: 'ExileSelf' }
            ],
            activeZone: ZoneRequirement.Graveyard,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ],
        }
    ],
    "power": "3",
    "toughness": "1"
};


