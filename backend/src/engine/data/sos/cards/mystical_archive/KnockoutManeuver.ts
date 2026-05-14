import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const KnockoutManeuver: CardDefinition = {
    name: "Knockout Maneuver",
    manaCost: "{2}{G}",


    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Put a +1/+1 counter on target creature you control, then it deals damage equal to its power to target creature an opponent controls.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [
                {
                    type: TargetType.Creature,
                    restrictions: [Restriction.YouControl],
                    count: 1
                },
                {
                    type: TargetType.Creature,
                    restrictions: [Restriction.OpponentControl],
                    count: 1
                }
            ],
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.SourcePower,
                    sourceMapping: TargetMapping.Target1,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ],
    scryfall_id: "42d90959-b88c-4321-b2af-78ac7aab9909",
    image_url: "https://cards.scryfall.io/normal/front/4/2/42d90959-b88c-4321-b2af-78ac7aab9909.jpg?1775936763",
    rarity: "uncommon"
};

