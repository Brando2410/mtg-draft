import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const DivergentEquation: CardDefinition = {
    "name": "Divergent Equation",
    "manaCost": "{X}{X}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Return up to X target instant and/or sorcery cards from your graveyard to your hand.\nExile Divergent Equation.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { 
                type: TargetType.CardInGraveyard, 
                minCount: 0, 
                count: 'X' as any, 
                restrictions: ['Instant_OR_Sorcery', 'YouControl'] 
            },
            effects: [
                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.TargetAll },
                { type: EffectType.Exile, targetMapping: TargetMapping.Self }
            ]
        }
    ]
};

