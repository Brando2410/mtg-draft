import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const IdolofEndurance: CardDefinition = {
    name: "Idol of Endurance",
    manaCost: "{2}{W}",
    scryfall_id: "3d2986f3-6623-455b-b9d9-231a4034ef8a",
    image_url: "https://cards.scryfall.io/normal/front/3/d/3d2986f3-6623-455b-b9d9-231a4034ef8a.jpg?1594735248",
    oracleText: "When Idol of Endurance enters the battlefield, exile all creature cards with mana value 3 or less from your graveyard until Idol of Endurance leaves the battlefield.\n{1}{W}, {T}: Until end of turn, you may cast a spell from among cards exiled with Idol of Endurance without paying its mana cost.",
    colors: ["W"],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.AllMatchingCards,
                    sourceZones: [Zone.Graveyard],
                    restrictions: [
                        Restriction.Creature,
                        Restriction.ManaValue3OrLess
                    ],
                    duration: { type: DurationType.UntilSourceLeavesBattlefield }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{W}' },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.AllowCastFromExile,
                    restrictions: [Restriction.ExiledWithSource],
                    isFreeCast: true,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
