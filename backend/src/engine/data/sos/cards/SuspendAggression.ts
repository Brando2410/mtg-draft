import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SuspendAggression: CardDefinition = {
    name: "Suspend Aggression",
    manaCost: "{1}{W}",
    scryfall_id: "0d3a5893-bc44-48f8-9a99-b1d55695085c",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/0/d/0d3a5893-bc44-48f8-9a99-b1d55695085c.jpg?1775937105",
    colors: ["W"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Exile target nonland permanent and the top card of your library. Until the end of that player's next turn, its owner may play those cards.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.NonlandPermanent,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ExileTopCard,
                    fromTop: 1,
                    sourceZones: [Zone.Library]
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'PARENT_CONTEXT_EXILED_IDS',
                    duration: {
                        type: DurationType.UntilEndOfYourNextTurn
                    },
                    targetControllerMapping: 'PARENT_CONTEXT_EXILED_IDS_OWNERS',
                    canPlayExiled: true,
                }
            ]
        }
    ]
};
