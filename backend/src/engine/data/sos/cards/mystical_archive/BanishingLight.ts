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
            targetDefinitions: [{
                type: TargetType.NonlandPermanent,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            }],
            effects: [
                {
                    type: EffectType.Exile,
                    duration: { type: DurationType.UntilSourceLeavesBattlefield },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    set: "soa",
    scryfall_id: "c45f11cd-a0aa-4d14-aa21-57f0969f3e2b",
    image_url: "https://cards.scryfall.io/normal/front/c/4/c45f11cd-a0aa-4d14-aa21-57f0969f3e2b.jpg?1752946576",
    rarity: "common"
};

