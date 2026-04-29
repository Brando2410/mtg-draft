import { AbilityType, CardDefinition, EffectType, Restriction, TargetType } from '@shared/engine_types';

export const HelpingHand: CardDefinition = {
    name: "Helping Hand",
    manaCost: "{W}",
    scryfall_id: "da5e29a8-a8fb-452b-9973-61ad613f9907",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/d/a/da5e29a8-a8fb-452b-9973-61ad613f9907.jpg?1775936387",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Return target creature card with mana value 3 or less from your graveyard to the battlefield tapped.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.Creature, Restriction.ManaValue3OrLess, Restriction.YouOwn],
                count: 1
            },
            effects: [
                {
                    type: EffectType.PutOnBattlefield,
                    tapped: true
                }
            ]
        }
    ]
};
