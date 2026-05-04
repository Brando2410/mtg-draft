import { AbilityType, CardDefinition, EffectType, Restriction, TargetType } from '@shared/engine_types';

export const Zombify: CardDefinition = {
    name: "Zombify",
    manaCost: "{3}{B}",
    scryfall_id: "89c89498-842c-4972-8822-26156e791f42",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/8/9/89c89498-842c-4972-8822-26156e791f42.jpg?1775936633",
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
    ]
};
