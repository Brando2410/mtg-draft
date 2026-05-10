import { AbilityType, CardDefinition, EffectType, Restriction, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 2,
                        minCount: 0,
                        restrictions: [
                            Restriction.Creature,
                            Restriction.YouControl
                        ]
                    }]
                },
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "d73612fe-8992-4650-a7e3-c7b662da6a03",
    image_url: "https://cards.scryfall.io/normal/front/d/7/d73612fe-8992-4650-a7e3-c7b662da6a03.jpg?1775937572",
    rarity: "common"
};

