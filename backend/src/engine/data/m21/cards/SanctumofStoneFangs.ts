import { AbilityType, CardDefinition, ConditionType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SanctumofStoneFangs: CardDefinition = {
    name: "Sanctum of Stone Fangs",
    manaCost: "{1}{B}",
    scryfall_id: "d1430973-57dd-484d-82fa-66a496a7eb19",
    image_url: "https://cards.scryfall.io/normal/front/d/1/d1430973-57dd-484d-82fa-66a496a7eb19.jpg?1594736353",
    oracleText: "At the beginning of your precombat main phase, each opponent loses X life and you gain X life, where X is the number of Shrines you control.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: DynamicAmount.ShrinesYouControlCount,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: DynamicAmount.ShrinesYouControlCount,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
