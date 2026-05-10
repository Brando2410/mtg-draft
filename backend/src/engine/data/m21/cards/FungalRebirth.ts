import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const FungalRebirth: CardDefinition = {
    name: "Fungal Rebirth",
    manaCost: "{2}{G}",

    oracleText: "Return target permanent card from your graveyard to your hand. If a creature died this turn, create two 1/1 green Saproling creature tokens.",
    colors: ["G"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [Restriction.Permanent, Restriction.YouOwn]
            }],
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.CreateToken,
                    condition: ConditionType.CreatureDiedThisTurn,
                    tokenBlueprint: {
                        name: "Saproling",
                        colors: ["G"],
                        types: ["Creature"],
                        subtypes: ["Saproling"],
                        power: 1,
                        toughness: 1,

                    },
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "4037e3b2-cb62-4f88-943d-3edcd6827c23",
    image_url: "https://cards.scryfall.io/normal/front/4/0/4037e3b2-cb62-4f88-943d-3edcd6827c23.jpg?1594736973",
    rarity: "uncommon"
};

