import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, RestrictionType } from "@shared/engine_types";

export const ChandraFlamesCatalyst: Record<string, ImplementableCard> = {
    "Chandra, Flame's Catalyst": {
        name: "Chandra, Flame's Catalyst",
        manaCost: "{4}{R}{R}",
        oracleText: "+1: Chandra deals 3 damage to each opponent.\n−2: You may cast target red instant or sorcery card from your graveyard this turn without paying its mana cost. If that spell would be put into your graveyard this turn, exile it instead.\n−8: Discard your hand, then draw seven cards. Until end of turn, you may cast spells from your hand without paying their mana costs.",
        colors: ["red"],
        supertypes: [],
        types: ["Planeswalker"],
        subtypes: ["Chandra"],
        power: "",
        toughness: "",
        keywords: [],
        loyalty: "5",
        abilities: [
            {
                id: "chandra_flames_catalyst_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: 1 }],
                oracleText: "+1: Chandra deals 3 damage to each opponent.",
                effects: [
                    {
                        type: EffectType.DealDamage,
                        amount: 3,
                        targetMapping: "EACH_OPPONENT"
                    }
                ]
            },
            {
                id: "chandra_flames_catalyst_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: -2 }],
                oracleText: "−2: You may cast target red instant or sorcery card from your graveyard this turn without paying its mana cost. If that spell would be put into your graveyard this turn, exile it instead.",
                targetDefinition: {
                    type: TargetType.CardInGraveyard,
                    restrictions: [
                        { color: "red" },
                        { types: ["Instant", "Sorcery"] }
                    ],
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: "TARGET_1",
                        duration: { type: "UNTIL_END_OF_TURN" },
                        isFreeCast: true,
                        abilitiesToAdd: [EffectType.AllowCastFromGraveyard],
                        exileOnMoveToGraveyard: true
                    }
                ]
            },
            {
                id: "chandra_flames_catalyst_minus_8",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: -8 }],
                oracleText: "−8: Discard your hand, then draw seven cards. Until end of turn, you may cast spells from your hand without paying their mana costs.",
                effects: [
                    {
                        type: EffectType.DiscardCards,
                        amount: (state: any, source: any) => {
                            const controller = state.players[source.controllerId];
                            return controller.hand.length;
                        },
                        targetMapping: "CONTROLLER"
                    },
                    {
                        type: EffectType.DrawCards,
                        amount: 7,
                        targetMapping: "CONTROLLER"
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: "CONTROLLER",
                        duration: { type: "UNTIL_END_OF_TURN" },
                        value: "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING"
                    }
                ]
            }
        ]
    }
};
