import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const VrynWingmare: CardDefinition = {
    name: "Vryn Wingmare",
    manaCost: "{2}{W}",
    oracleText: "Flying\nNoncreature spells cost {1} more to cast.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Pegasus"],
    power: "2",
    toughness: "1",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.SpellTax,
                    amount: 1,
                    restrictions: [
                { type: 'Type', value: 'Noncreature' }
            ],
                    targetMapping: TargetMapping.EachPlayer
                }
            ]
        }
    ]
};

