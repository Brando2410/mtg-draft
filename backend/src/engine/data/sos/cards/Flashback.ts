import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const Flashback: CardDefinition = {
    name: "Flashback",
    manaCost: "{R}",
    scryfall_id: "1b832fda-d7c4-4566-884c-2a8b6da15488",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/1/b/1b832fda-d7c4-4566-884c-2a8b6da15488.jpg?1775937742",
    colors: ["R"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. (You may cast that card from your graveyard for its flashback cost. Then exile it.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [
                    Restriction.InstantOrSorcery, Restriction.YouOwn]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    label: "Select an instant or sorcery in your graveyard to gain Flashback",
                    targetMapping: TargetMapping.Target1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Flashback'],
                    flashbackCostOverride: 'SOURCE_MANA_COST'
                }
            ]
        }
    ]
};
