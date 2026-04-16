import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const BaneslayerAngel: CardDefinition = {
    name: "Baneslayer Angel",
    manaCost: "{3}{W}{W}",
    oracleText: "Flying, first strike, lifelink, protection from Demons and from Dragons",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Angel"],
    power: "5",
    toughness: "5",
    keywords: ["Flying", "First strike", "Lifelink"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                { type: EffectType.ApplyContinuousEffect, abilitiesToAdd: ['Protection from Demons', 'Protection from Dragons'], targetMapping: TargetMapping.Self }
            ]
        }
    ]
};

