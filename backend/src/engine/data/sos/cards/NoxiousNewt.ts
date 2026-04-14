import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const NoxiousNewt: CardDefinition = {
    "name": "Noxious Newt",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Salamander"
    ],
    "oracleText": "Deathtouch\n{T}: Add {G}.",
    "keywords": ["Deathtouch"],
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap', value: true }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    mana: '{G}',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "2"
};



