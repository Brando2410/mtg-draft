import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SchemingSilvertongueSigninBlood: CardDefinition = {
    name: "Scheming Silvertongue // Sign in Blood",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    power: "1",
    toughness: "3",
    image_url: "https://cards.scryfall.io/png/front/f/e/fe85a124-0d8b-4a29-8df1-65888a39147f.png?1775937600",
    keywords: ["Flying", "Lifelink", "Prepared"],
    oracleText: "Flying, lifelink\nAt the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PostCombatMainPhaseStart,
            condition: "LIFE_GAINED_2_OR_MORE_THIS_TURN",
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],

    preparedFace: {
        name: "Sign in Blood",
        image_url: "https://cards.scryfall.io/png/front/3/7/37096e0c-cbf2-4931-a9f9-2b002882aee1.png?1623548332",
        manaCost: "{B}{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Target player draws two cards and loses 2 life.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player
                },
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 2,
                        targetMapping: TargetMapping.Target1
                    },
                    {
                        type: EffectType.LoseLife,
                        amount: 2,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};

