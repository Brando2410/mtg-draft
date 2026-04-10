import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const HoodedBlightfang: Record<string, ImplementableCard> = {
    "Hooded Blightfang": {
        name: "Hooded Blightfang",
        manaCost: "{2}{B}",
        oracleText: "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Snake"],
        power: "1",
        toughness: "4",
        keywords: ["Deathtouch"],
        abilities: [
            {
                id: "hooded_blightfang_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: "ON_ATTACK",
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const attacker = state.battlefield.find((o: any) => o.id === event.sourceId);
                    if (!attacker || attacker.controllerId !== source.controllerId) return false;
                    const { LayerProcessor } = require('../../modules/state/LayerProcessor');
                    const stats = LayerProcessor.getEffectiveStats(attacker, state);
                    return stats.keywords.includes('Deathtouch');
                },
                effects: [
                    { type: EffectType.LoseLife, amount: 1, targetMapping: "EACH_OPPONENT" },
                    { type: EffectType.GainLife, amount: 1, targetMapping: "CONTROLLER" }
                ],
                oracleText: "Whenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life."
            },
            {
                id: "hooded_blightfang_planeswalker_damage",
                type: AbilityType.Triggered,
                triggerEvent: "ON_DAMAGE_TAKED",
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const targetObj = state.battlefield.find((o: any) => o.id === event.targetId);
                    if (!targetObj || !targetObj.definition.types.some((t: string) => t.toLowerCase() === 'planeswalker')) return false;

                    const sourceObj = state.battlefield.find((o: any) => o.id === event.sourceId);
                    if (!sourceObj || sourceObj.controllerId !== source.controllerId) return false;

                    const { LayerProcessor } = require('../../modules/state/LayerProcessor');
                    const stats = LayerProcessor.getEffectiveStats(sourceObj, state);
                    return stats.keywords.includes('Deathtouch');
                },
                effects: [{
                    type: EffectType.Destroy,
                    targetMapping: "EVENT_TARGET"
                }],
                oracleText: "Whenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker."
            }
        ]
    }
};
