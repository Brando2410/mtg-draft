import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SparringRegimen: CardDefinition = {
    name: "Sparring Regimen",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Enchantment"],
    oracleText: "Whenever you attack, put a +1/+1 counter on target attacking creature you control and untap it. Then learn.",
    abilities: [{
        type: AbilityType.Triggered,
        eventMatch: TriggerEvent.Attack,
        condition: ConditionType.IsYourTurn,
        targetDefinitions: [{ count: 1, type: TargetType.Creature, restrictions: [Restriction.Attacking, Restriction.YouControl] }],
        effects: [
            {
                type: EffectType.AddCounters,
                counterType: 'P1P1',
                amount: 1,
                targetMapping: TargetMapping.Target1
            },
            {
                type: EffectType.Untap,
                targetMapping: TargetMapping.Target1
            },
            {
                type: EffectType.Learn
            }
        ]
    }],
    scryfall_id: "ab7c80d3-3e0c-4510-9ed0-bb9fe39d838f",
    image_url: "https://cards.scryfall.io/normal/front/a/b/ab7c80d3-3e0c-4510-9ed0-bb9fe39d838f.jpg?1624589767",
    rarity: "rare"
};

