import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const Revitalize: CardDefinition = {
    name: "Revitalize",
    manaCost: "{1}{W}",
    oracleText: "You gain 3 life.\nDraw a card.",
    colors: ["W"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]

};


