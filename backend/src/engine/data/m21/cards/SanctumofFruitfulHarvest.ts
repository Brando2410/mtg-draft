import { AbilityType, CardDefinition, EffectType, GameObject, GameState, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

const countShrines = (state: GameState, source: GameObject) =>
    state.battlefield.filter(o => o.controllerId === source.controllerId && (o.definition.subtypes || []).includes('Shrine')).length;

export const SanctumofFruitfulHarvest: CardDefinition = {
    name: "Sanctum of Fruitful Harvest",
    manaCost: "{2}{G}",
    oracleText: "At the beginning of your precombat main phase, add X mana of any one color, where X is the number of Shrines you control.",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            activeZone: Zone.Battlefield,
            condition: (state, event, ability) => event.playerId === ability.controllerId,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'ANY',
                    amount: countShrines,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

