import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone, SelectionType } from '@shared/engine_types';

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
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    selectionType: SelectionType.Search,
                    label: "Select up to two creature cards to return to your hand",
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 2,
                        minCount: 0,
                        restrictions: [
                            Restriction.Creature,
                            Restriction.Yours
                        ]
                    }
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
