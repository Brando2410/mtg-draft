import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SparringRegimen: CardDefinition = {
    name: "Sparring Regimen",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Enchantment"],
    oracleText: "Whenever you attack, put a +1/+1 counter on target attacking creature you control and untap it. Then learn.",
    abilities: [{
        type: AbilityType.Triggered,
        eventMatch: TriggerEvent.Attack,
        condition: "OnYourAttack",
        targetDefinition: { count: 1, type: TargetType.Creature, restrictions: ['attacking', 'youcontrol'] },
        effects: [
            { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 },
            { type: EffectType.Untap, targetMapping: TargetMapping.Target1 },
            { type: EffectType.Learn }
        ]
    }]
};



