import { AbilityType, CardDefinition, EffectType, Restriction, TargetType } from '@shared/engine_types';

export const Zombify: CardDefinition = {
    name: "Zombify",
    manaCost: "{3}{B}",
    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Return target creature card from your graveyard to the battlefield.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.Creature, Restriction.YouOwn, Restriction.YouOwn],
                count: 1
            }],
            effects: [
                {
                    type: EffectType.PutOnBattlefield
                }
            ]
        }
    ],
    scryfall_id: "89c89498-842c-4972-8822-26156e791f42",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc798e6f-13c4-457c-b052-b7b65bc83cfe.jpg?1730489291",
    rarity: "uncommon"
};

