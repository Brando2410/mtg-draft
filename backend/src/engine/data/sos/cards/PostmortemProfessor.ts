import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, ZoneRequirement } from '@shared/engine_types';

export const PostmortemProfessor: CardDefinition = {
    "name": "Postmortem Professor",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Zombie",
        "Warlock"
    ],
    "oracleText": "This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.",
    "keywords": ["CannotBlock"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Graveyard,
            costs: [
                { type: 'Mana', value: '{1}{B}' },
                {
                    type: 'Exile',
                    sourceZones: [Zone.Graveyard],
                    restrictions: ['Instant_or_Sorcery']
                }
            ],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};
