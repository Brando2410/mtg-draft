import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const JoinedResearchersSecretRendezvous: CardDefinition = {
    name: "Joined Researchers // Secret Rendezvous",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric", "Wizard"],
    power: "2",
    toughness: "2",
    keywords: ["First strike", "Prepared"],
    oracleText: "First strike\nAt the beginning of each end step, if an opponent has more cards in hand than you, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    image_url: "https://cards.scryfall.io/png/front/1/e/1ebaafe0-3a9a-424c-8698-d26e7be45343.png?1775937069",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'OPPONENT_HAS_MORE_CARDS',
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],

    preparedFace: {
        name: "Secret Rendezvous",
        image_url: "https://cards.scryfall.io/png/front/9/b/9be712b3-14ed-4a73-b3d3-5b76b2c5db64.png?1775940773",
        manaCost: "{1}{W}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "You and target opponent each draw three cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1,
                    restrictions: [{ type: 'Opponent' } as any]
                },
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 3,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.DrawCards,
                        amount: 3,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
