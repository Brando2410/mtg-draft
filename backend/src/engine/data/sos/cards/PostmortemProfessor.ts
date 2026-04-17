import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const PostmortemProfessor: CardDefinition = {
    name: "Postmortem Professor",
    manaCost: "{1}{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Zombie",
        "Warlock"
    ],
    power: "2",
    toughness: "2",
    keywords: ["CannotBlock"],
    oracleText: "This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'EVENT_SOURCE_IS_SELF',
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [
                { type: CostType.Mana, value: '{1}{B}' },
                {
                    type: CostType.Exile,
                    sourceZones: ['Graveyard'],
                    restrictions: [
                        { type: 'Type', value: 'InstantOrSorcery' }
                    ]
                }
            ],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
};
