import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const ForumNecroscribe: CardDefinition = {
    name: "Forum Necroscribe",
    manaCost: "{5}{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Troll",
        "Warlock"
    ],
    power: "5",
    toughness: "4",
    keywords: ["Ward—Discard a card"],
    oracleText: "Ward—Discard a card.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, return target creature card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            targets: [{
                type: TargetType.CardInGraveyard, restrictions: [
                    "Creature",
                    "youcontrol"
                ]
            }],
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
