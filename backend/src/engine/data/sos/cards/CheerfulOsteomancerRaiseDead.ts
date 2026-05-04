import { AbilityType, CardDefinition, EffectType, Restriction, SelectionType, TargetType, Zone } from '@shared/engine_types';
export const CheerfulOsteomancerRaiseDead: CardDefinition = {
    name: "Cheerful Osteomancer",
    manaCost: "{3}{B}",
    scryfall_id: "3c34660c-25e3-4ff5-9b2b-5554ded2bcc3",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/c/3c34660c-25e3-4ff5-9b2b-5554ded2bcc3.jpg?1775937441",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Orc", "Warlock"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "4",
    toughness: "2",

    entersPrepared: true,
    preparedFace: {
        name: "Raise Dead",
        image_url: "https://cards.scryfall.io/png/front/4/9/4950c3c2-80c1-4447-ac38-cf40f76b9545.png?1562198355",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Return target creature card from your graveyard to your hand.",
        abilities: [
            {
                type: AbilityType.Spell,

                effects: [{
                    selectionType: SelectionType.Search,
                    label: "Select one creature card to return to your hand",
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: [Restriction.Creature, Restriction.YouControl]
                    }],
                }]
            }
        ]
    }
};

