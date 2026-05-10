import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';
export const WisdomofAges: CardDefinition = {
    name: "Wisdom of Ages",
    manaCost: "{4}{U}{U}{U}",
    colors: ["U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    exileOnResolution: true,
    oracleText: "Return all instant and sorcery cards from your graveyard to your hand. You have no maximum hand size for the rest of the game.\nExile Wisdom of Ages.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    label: "Return all instant and sorcery cards from your graveyard to your hand",
                    zone: Zone.Hand,
                    sourceZones: [Zone.Graveyard],
                    restrictions: [Restriction.InstantOrSorcery, Restriction.YouOwn],
                    targetMapping: TargetMapping.AllMatchingCards
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.Permanent },
                    playerModifier: { maxHandSize: 999 },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "b227ef04-33e4-44e8-a357-0ea3dfe5d49b",
    image_url: "https://cards.scryfall.io/normal/front/b/2/b227ef04-33e4-44e8-a357-0ea3dfe5d49b.jpg?1775937405",
    rarity: "rare"
};

