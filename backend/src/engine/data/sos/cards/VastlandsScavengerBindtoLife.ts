import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const VastlandsScavengerBindtoLife: CardDefinition = {
    "name": "Vastlands Scavenger // Bind to Life",
    "manaCost": "{1}{G}{G} // {4}{G}",
    "colors": ["G"],
    "types": ["Creature"],
    "subtypes": ["Bear", "Druid"],
    "oracleText": "Deathtouch\nThis creature enters prepared.",
    "entersPrepared": true,
    "keywords": ["Deathtouch"],
    "power": "4",
    "toughness": "4",
    "faces": [
        {
            "name": "Vastlands Scavenger",
            "manaCost": "{1}{G}{G}",
            "colors": ["G"],
            "types": ["Creature"],
            "subtypes": ["Bear", "Druid"],
            "oracleText": "Deathtouch\nThis creature enters prepared.",
            "entersPrepared": true,
            "keywords": ["Deathtouch"],
            "power": "4",
            "toughness": "4"
        },
        {
            "name": "Bind to Life",
            "manaCost": "{4}{G}",
            "colors": ["G"],
            "types": ["Instant"],
            "oracleText": "Mill seven cards. Then put a creature card from among them onto the battlefield.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        { type: EffectType.Mill, amount: 7, targetMapping: TargetMapping.Controller },
                        { 
                            type: EffectType.Choice, 
                            targetIdMapping: TargetMapping.LastMilledIds,
                            restrictions: ['Creature'],
                            label: 'Put a creature card from among them onto the battlefield',
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield }]
                        }
                    ]
                }
            ]
        }
    ]
};


