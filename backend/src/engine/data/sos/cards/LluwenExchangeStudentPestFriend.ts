import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, Zone, SelectionType } from '@shared/engine_types';

export const LluwenExchangeStudentPestFriend: CardDefinition = {
    name: "Lluwen, Exchange Student",
    manaCost: "{2}{B}{G}",
    colors: ["B", "G"],
    types: ["Legendary", "Creature"],
    subtypes: ["Elf", "Druid"],
    power: "3",
    toughness: "4",
    keywords: ["Prepared"],
    oracleText: "Lluwen enters prepared.\nExile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.",
    entersPrepared: true,
    abilities: [
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                {
                    type: 'Exile',
                    zone: Zone.Graveyard,
                    amount: 1,
                    restrictions: ['Creature']
                }
            ],
            effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
        }
    ],

    preparedFace: {
        name: "Pest Friend",
        manaCost: "{B/G}",
        colors: ["B", "G"],
        types: ["Sorcery"],
        oracleText: "Create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: "Pest",
                            colors: ["B", "G"],
                            types: ["Creature", "Token"],
                            subtypes: ["Pest"],
                            power: "1",
                            toughness: "1",
                            oracleText: "Whenever this creature attacks, you gain 1 life.",
                            abilities: [
                                {
                                    type: AbilityType.Triggered,
                                    eventMatch: TriggerEvent.Attack,
                                    effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                                }
                            ]
                        },
                        amount: 1,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
