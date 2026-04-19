import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const HuntersEdge: CardDefinition = {
    name: "Hunter's Edge",
    manaCost: "{3}{G}",
    scryfall_id: "7c08c80f-f27c-4e3a-b048-143aea740096",
    image_url: "https://cards.scryfall.io/normal/front/7/c/7c08c80f-f27c-4e3a-b048-143aea740096.jpg?1594737048",
    oracleText: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature you don't control.",
    colors: ["G"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 2,
                perTargetRestrictions: [
                    ['YouControl'],
                    ['OpponentControl']
                ]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.Target1Power,
                    sourceMapping: TargetMapping.Target1,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ]
};


