import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const LilianasScorn: CardDefinition = {
    name: "Liliana's Scorn",
    manaCost: "{3}{B}{B}",
    scryfall_id: "b231f941-4acb-46f2-81ae-16e5a28e65af",
    image_url: "https://cards.scryfall.io/normal/front/b/2/b231f941-4acb-46f2-81ae-16e5a28e65af.jpg?1596250190",
    oracleText: "Destroy target creature. You may search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.SearchLibrary,
                    label: "Search for Liliana, Death Mage",
                    optional: true,
                    reveal: true,
                    zone: Zone.Hand,
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    targetDefinition: {
                        type: TargetType.Card,
                        restrictions: [{ type: 'Name', value: 'Liliana, Death Mage' }],
                        count: 1,
                        minCount: 0
                    },
                }
            ]
        }
    ]
};
