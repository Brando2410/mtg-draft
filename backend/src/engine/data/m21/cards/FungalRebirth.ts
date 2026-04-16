import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const FungalRebirth: CardDefinition = {
    name: "Fungal Rebirth",
    manaCost: "{2}{G}",
    oracleText: "Return target permanent card from your graveyard to your hand. If a creature died this turn, create two 1/1 green Saproling creature tokens.",
    colors: ["G"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: ['Permanent', 'YouControl']
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.CreateToken,
                    condition: 'CREATURE_DIED_THIS_TURN',
                    tokenBlueprint: {
                        name: "Saproling",
                        colors: ["G"],
                        types: ["Creature"],
                        subtypes: ["Saproling"],
                        power: 1,
                        toughness: 1
                    },
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

