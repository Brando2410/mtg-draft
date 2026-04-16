import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const HoodedBlightfang: CardDefinition = {
    name: "Hooded Blightfang",
    manaCost: "{2}{B}",
    oracleText: "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Snake"],
    power: "1",
    toughness: "4",
    keywords: ["Deathtouch"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: (state: any, event: any, source: any) => {
                const attacker = state.battlefield.find((o: any) => o.id === event.sourceId);
                return attacker &&
                    attacker.controllerId === source.controllerId &&
                    attacker.effectiveStats?.keywords?.includes('Deathtouch');
            },
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealt,
            condition: (state: any, event: any, source: any) => {
                const targetObj = state.battlefield.find((o: any) => o.id === event.targetId);
                if (!targetObj?.definition.types.some((t: string) => t.toLowerCase() === 'planeswalker')) return false;

                const sourceObj = state.battlefield.find((o: any) => o.id === event.sourceId);
                return sourceObj &&
                    sourceObj.controllerId === source.controllerId &&
                    sourceObj.effectiveStats?.keywords?.includes('Deathtouch');
            },
            effects: [{
                type: EffectType.Destroy,
                targetMapping: TargetMapping.EventTarget
            }]
        }
    ]
};




