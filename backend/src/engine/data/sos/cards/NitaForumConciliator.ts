import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const NitaForumConciliator: CardDefinition = {
    name: "Nita, Forum Conciliator",
    manaCost: "{1}{W}{B}",
    scryfall_id: "fd80a87d-35d3-4ad1-8172-c85e93032d1d",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/f/d/fd80a87d-35d3-4ad1-8172-c85e93032d1d.jpg?1775938431",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Human",
        "Advisor"
    ],
    keywords: [],
    power: "2",
    toughness: "3",
    oracleText: "Whenever you cast a spell you don't own, put a +1/+1 counter on each creature you control.\n{2}, Sacrifice another creature: Exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead. Activate only as a sorcery.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'EVENT_OBJECT_OWNER_NOT_YOU',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 1,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: CostType.Mana, value: '{2}' },
                {
                    type: CostType.Sacrifice,
                    targetMapping: TargetMapping.OtherCreaturesYouControl
                }
            ],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [
                    "opponentcontrol",
                    "InstantOrSorcery"
                ]
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.LastExiledObject,
                    canPlayExiled: true,
                    spendAnyMana: true,
                    exileOnMoveToGraveyard: true,
                    redirectConditions: { zone: Zone.Graveyard, onLeaveZone: CostType.Exile }
                }
            ],
        }
    ]
};
