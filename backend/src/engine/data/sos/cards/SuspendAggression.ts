import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SuspendAggression: CardDefinition = {
    name: "Suspend Aggression",
    manaCost: "{1}{W}",
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
                    canPlayExiled: true
                }
            ]
        }
    ],
    scryfall_id: "135c0696-d86d-4e48-988c-5c218de451fc",
    image_url: "https://cards.scryfall.io/normal/front/1/3/135c0696-d86d-4e48-988c-5c218de451fc.jpg?1775938648",
    rarity: "rare"
};

