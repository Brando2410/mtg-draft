import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const MomentofReckoning: CardDefinition = {
    name: "Moment of Reckoning",
    manaCost: "{3}{W}{W}{B}{B}",


    colors: ["B", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose up to four. You may choose the same mode more than once.\n• Destroy target nonland permanent.\n• Return target nonland permanent card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 4,
            allowDuplicates: true,
            modes: [
                {
                    label: "Destroy target nonland permanent",
                    targetDefinitions: [{ type: TargetType.NonlandPermanent, count: 1 }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: "Return target nonland permanent card from your graveyard",
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: [Restriction.NonLand, Restriction.Permanent, Restriction.YouOwn]
                    }],
                    effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ],
    scryfall_id: "577d9dc8-7720-4dc9-b650-64b4729b309b",
    image_url: "https://cards.scryfall.io/normal/front/5/7/577d9dc8-7720-4dc9-b650-64b4729b309b.jpg?1775938423",
    rarity: "rare"
};

