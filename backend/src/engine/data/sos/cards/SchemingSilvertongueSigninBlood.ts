import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const SchemingSilvertongueSigninBlood: CardDefinition = {
    name: "Scheming Silvertongue // Sign in Blood",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    keywords: ["Flying", "Lifelink", "Prepared"],
    oracleText: "Flying, lifelink\nAt the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "1",
    toughness: "3",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PostCombatMainPhaseStart,
            condition: ConditionType.LifeGained2OrMoreThisTurn,
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

        manaCost: "{B}{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Target player draws two cards and loses 2 life.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Player
                }],
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
        ],

    },
    rarity: "rare",
    scryfall_id: "fe85a124-0d8b-4a29-8df1-65888a39147f",
    image_url: "https://cards.scryfall.io/normal/front/f/e/fe85a124-0d8b-4a29-8df1-65888a39147f.jpg?1778165124",
};
