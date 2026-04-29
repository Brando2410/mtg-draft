import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const NitaForumConciliator: CardDefinition = {
    name: "Nita, Forum Conciliator",
    manaCost: "{1}{W}{B}",
    scryfall_id: "fd80a87d-35d3-4ad1-8172-c85e93032d1d",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/f/d/fd80a87d-35d3-4ad1-8172-c85e93032d1d.jpg?1775938431",
    colors: ["B", "W"],
    types: ["Legendary", "Creature"],
    subtypes: ["Human", "Advisor"],
    keywords: [],
    power: "2",
    toughness: "3",
    oracleText: "Whenever you cast a spell you don't own, put a +1/+1 counter on each creature you control.\n{2}, Sacrifice another creature: Exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead. Activate only as a sorcery.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state: any, event: any, t: any) => {
                const casterId = event.playerId;
                const spell = event.payload?.card;
                return String(casterId) === String(t.controllerId) && spell && String(spell.ownerId) !== String(casterId);
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: "P1P1",
                    amount: 1,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: CostType.Mana, value: "{2}" },
                { type: CostType.Sacrifice, restrictions: [Restriction.Other, Restriction.Creature], amount: 1 }
            ],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.InstantOrSorcery, Restriction.OpponentOwns],
                count: 1
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Target1,
                    canPlayExiled: true,
                    spendAnyMana: true,
                    exileOnMoveToGraveyard: true
                }
            ]
        }
    ]
};
