import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

export const TriumphoftheHordes: CardDefinition = {
    name: "Triumph of the Hordes",
    manaCost: "{2}{G}{G}",
    scryfall_id: "5a0bc9d4-d99d-48e1-aeca-d2e5b1c99a84",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/5/a/5a0bc9d4-d99d-48e1-aeca-d2e5b1c99a84.jpg?1775936799",
    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Until end of turn, creatures you control get +1/+1 and gain trample and infect. (Creatures with infect deal damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    abilitiesToAdd: ["Trample", "Infect"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};
