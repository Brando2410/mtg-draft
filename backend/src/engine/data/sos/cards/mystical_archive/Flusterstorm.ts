import { CardDefinition } from '@shared/engine_types';

export const Flusterstorm: CardDefinition = {
    name: "Flusterstorm",
    manaCost: "{U}",
    scryfall_id: "ba8fa9db-f24f-46d4-add1-71b7f77636e2",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/b/a/ba8fa9db-f24f-46d4-add1-71b7f77636e2.jpg?1775936489",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: ["Storm"],
    oracleText: "Counter target instant or sorcery spell unless its controller pays {1}.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    set: "soa",
    abilities: [
        /*  {
            type: AbilityType.Spell,
            storm: true,
            targetDefinition: {
                type: TargetType.Spell,
                restrictions: [{ type: Restriction.Any, restrictions: [Restriction.Instant, Restriction.Sorcery] }],
                count: 1
            },
            effects: [
                {
                    type: EffectType.CounterSpell,
                    tax: "{1}"
                }
            ]
          }*/
    ]
};
