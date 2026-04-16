import { AbilityType, CardDefinition, EffectType, GameObject, GameState, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

const countShrines = (state: GameState, source: GameObject) =>
    state.battlefield.filter(o => o.controllerId === source.controllerId && (o.definition.subtypes || []).includes('Shrine')).length;

export const SanctumofStoneFangs: CardDefinition = {
    name: "Sanctum of Stone Fangs",
    manaCost: "{1}{B}",
    oracleText: "At the beginning of your precombat main phase, each opponent loses X life and you gain X life, where X is the number of Shrines you control.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            id: "sanctum_stone_fangs_trigger",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            activeZone: Zone.Battlefield,
            condition: (state, event, ability) => event.playerId === ability.controllerId,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: countShrines,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: countShrines,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

