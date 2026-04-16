import { AbilityType, CardDefinition, EffectType, GameObject, GameState, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

const countShrines = (state: GameState, source: GameObject) =>
    state.battlefield.filter(o => o.controllerId === source.controllerId && (o.definition.subtypes || []).includes('Shrine')).length;

export const SanctumofShatteredHeights: CardDefinition = {
    name: "Sanctum of Shattered Heights",
    manaCost: "{2}{R}",
    oracleText: "At the beginning of your precombat main phase, you may pay {1} and discard a land or Shrine card. If you do, Sanctum of Shattered Heights deals X damage to target creature or planeswalker, where X is the number of Shrines you control.",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            activeZone: Zone.Battlefield,
            condition: (state, event, ability) => event.playerId === ability.controllerId,
            targetDefinition: {
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Pay {1} and discard a land or Shrine card?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                { type: EffectType.PayMana, value: "{1}" },
                                { type: EffectType.DiscardCards, amount: 1, restrictions: ["Land", "Shrine"] },
                                {
                                    type: EffectType.DealDamage,
                                    amount: countShrines,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};


