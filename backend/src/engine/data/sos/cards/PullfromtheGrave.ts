import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
                count: { min: 0, max: 2 },
                restrictions: [
                    Restriction.Creature,
                    Restriction.Yours
                ]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.TargetAll, // Pull all chosen targets from the stack selection
                    label: "Return selected creature cards to your hand"
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
