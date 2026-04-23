import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Pongify: CardDefinition = {
    name: "Pongify",
    manaCost: "{U}",
    scryfall_id: "099a5ccb-0d04-406a-9357-147321272659",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/0/9/099a5ccb-0d04-406a-9357-147321272659.jpg?1775936499",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target creature. It can't be regenerated. Its controller creates a 3/3 green Ape creature token.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.Destroy
                },
                {
                    type: EffectType.CreateToken,
                    targetMapping: TargetMapping.Controller,
                    amount: 1,
                    tokenDefinition: {
                        name: "Ape",
                        colors: ["G"],
                        types: ["Creature"],
                        subtypes: ["Ape"],
                        power: 3,
                        toughness: 3
                    }
                }
            ]
        }
    ]
};
