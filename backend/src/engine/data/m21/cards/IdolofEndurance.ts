import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const IdolofEndurance: CardDefinition = {
    name: "Idol of Endurance",
    manaCost: "{2}{W}",
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
    ],
    scryfall_id: "4d60e84e-be05-49da-9720-4225abe9d003",
    image_url: "https://cards.scryfall.io/normal/front/4/d/4d60e84e-be05-49da-9720-4225abe9d003.jpg?1612316288",
    rarity: "rare"
};

