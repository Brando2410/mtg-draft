import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const PullfromtheGrave: CardDefinition = {
    name: "Pull from the Grave",
    manaCost: "{2}{B}",
    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Return up to two target creature cards from your graveyard to your hand. You gain 2 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 2,
                minCount: 0,
                restrictions: [
                    Restriction.Creature,
                    "youcontrol"
                ]
            },
            effects: [
                {
                    type: EffectType.PutInHand,
                    targetMapping: TargetMapping.TargetAll
                },
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
