import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const DivergentEquation: CardDefinition = {
    name: "Divergent Equation",
    manaCost: "{X}{X}{U}",

    colors: ["U"],
    types: ["Instant"],
    exileOnResolution: true,
    oracleText: "Return up to X target instant and/or sorcery cards from your graveyard to your hand.",
    abilities: [
        {
            type: AbilityType.Spell,

            targetDefinitions: [{
                type: TargetType.CardInGraveyard,
                count: 'X',
                minCount: 0,
                restrictions: [
                    Restriction.InstantOrSorcery,
                    Restriction.YouOwn
                ]
            }],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.SelectedCard
                }
            ]
        }
    ],
    scryfall_id: "26295e25-f1bf-4665-ba00-dad35c49bbc2",
    image_url: "https://cards.scryfall.io/normal/front/2/6/26295e25-f1bf-4665-ba00-dad35c49bbc2.jpg?1775937210",
    rarity: "uncommon"
};

