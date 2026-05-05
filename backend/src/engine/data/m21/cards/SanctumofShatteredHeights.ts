import { AbilityType, CardDefinition, ConditionType, CostType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SanctumofShatteredHeights: CardDefinition = {
    name: "Sanctum of Shattered Heights",
    manaCost: "{2}{R}",
    scryfall_id: "28499462-8b4b-4b2a-9d7f-9445ced2ee76",
    image_url: "https://cards.scryfall.io/normal/front/2/8/28499462-8b4b-4b2a-9d7f-9445ced2ee76.jpg?1594736814",
    oracleText: "At the beginning of your precombat main phase, you may pay {1} and discard a land or Shrine card. If you do, Sanctum of Shattered Heights deals X damage to target creature or planeswalker, where X is the number of Shrines you control.",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.PlayerIsController,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
            }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Pay {1} and discard a land or Shrine card?",
                    choices: [
                        {
                            label: "Yes",
                            costs: [
                                { type: CostType.Mana, value: "{1}" },
                                {
                                    type: CostType.Discard,
                                    amount: 1,
                                    restrictions: [Restriction.LandOrShrine]
                                }
                            ],
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: DynamicAmount.ShrinesYouControlCount,
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
