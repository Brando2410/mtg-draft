import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const LluwenExchangeStudentPestFriend: CardDefinition = {
    name: "Lluwen, Exchange Student // Pest Friend",
    manaCost: "{2}{B}{G}",
    colors: ["B", "G"],
    types: ["Legendary", "Creature"],
    subtypes: ["Elf", "Druid"],
    keywords: ["Prepared"],
    oracleText: "Lluwen enters prepared.\nExile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.",
    power: "3",
    toughness: "4",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/a/0/a0bcb638-c3c8-4973-9537-5c471f43f34f.png?1775938382",
    abilities: [
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                {
                    type: CostType.Exile,
                    zone: Zone.Graveyard,
                    amount: 1,
                    restrictions: [
                { type: 'Type', value: 'Creature' }
            ]
                }
            ],
            effects: [{ type: EffectType.Prepare, targetMapping: TargetType.Self }]
        }
    ],
    preparedFace: {
        name: "Pest Friend",
        image_url: "https://cards.scryfall.io/png/front/a/0/a0bcb638-c3c8-4973-9537-5c471f43f34f.png?1775938382",
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
                            image_url: "https://cards.scryfall.io/png/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.png?1682693901",
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
    