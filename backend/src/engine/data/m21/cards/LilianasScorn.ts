import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LilianasScorn: CardDefinition = {
    name: "Liliana's Scorn",
    manaCost: "{2}{B}{B}",
    scryfall_id: "0d0f4133-c284-486a-8451-24af1e93895e",
    image_url: "https://cards.scryfall.io/normal/front/0/d/0d0f4133-c284-486a-8451-24af1e93895e.jpg?1596250212",
    oracleText: "Destroy target creature. You may search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [
                { type: EffectType.Destroy, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.SearchLibrary,
                    label: "Search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand.",
                    targetDefinitions: [{
                        type: TargetType.Card,
                        count: 1,
                        restrictions: [{ type: Restriction.Name, value: 'Liliana, Death Mage' }]
                    }],
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
