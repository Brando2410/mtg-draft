import { AbilityType, CardDefinition, EffectType, GameObject, GameState, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

const countShrines = (state: GameState, source: GameObject) =>
    state.battlefield.filter(o => o.controllerId === source.controllerId && (o.definition.subtypes || []).includes('Shrine')).length;

export const SanctumofCalmWaters: CardDefinition = {
    name: "Sanctum of Calm Waters",
    manaCost: "{3}{U}",
    oracleText: "At the beginning of your precombat main phase, you may draw X cards, where X is the number of Shrines you control. If you do, discard a card.",
    colors: ["U"],
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
                    type: EffectType.Choice,
                    label: "Draw X cards and discard a card?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: countShrines,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
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

