import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BanishingLight: CardDefinition = {
    name: "Banishing Light",
    manaCost: "{2}{W}",
    oracleText: "When Banishing Light enters the battlefield, exile target nonland permanent an opponent controls until Banishing Light leaves the battlefield.",
    colors: ["W"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.NonlandPermanent,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            },
            effects: [
                {
                    type: EffectType.Exile,
                    duration: { type: DurationType.UntilSourceLeavesBattlefield },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
