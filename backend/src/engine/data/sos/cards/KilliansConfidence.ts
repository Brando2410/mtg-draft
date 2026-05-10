import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const KilliansConfidence: CardDefinition = {
    name: "Killian's Confidence",
    manaCost: "{W}{B}",


    colors: ["B", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets +1/+1 until end of turn. Draw a card.\nWhenever one or more creatures you control deal combat damage to a player, you may pay {W/B}. If you do, return this card from your graveyard to your hand.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CombatDamagePlayer,
            activeZone: Zone.Graveyard,
            condition: "EVENT_SOURCES_CONTROLLED_BY_YOU",
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Return Killian's Confidence to hand?",
                    choices: [
                        {
                            label: "Pay {W/B}",
                            costs: [{ type: CostType.Mana, value: '{W/B}' }],
                            effects: [
                                { type: EffectType.ReturnToHand, targetMapping: TargetMapping.Self }
                            ]
                        },
                        { label: "Decline", effects: [] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "55ff776a-fc3b-4338-8864-d57a85b3f123",
    image_url: "https://cards.scryfall.io/normal/front/5/5/55ff776a-fc3b-4338-8864-d57a85b3f123.jpg?1775938369",
    rarity: "uncommon"
};

