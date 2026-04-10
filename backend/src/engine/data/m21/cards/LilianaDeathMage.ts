import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LilianaDeathMage: Record<string, ImplementableCard> = {
    "Liliana, Death Mage": {
        name: "Liliana, Death Mage",
        manaCost: "{4}{B}{B}",
        oracleText: "+1: Return up to one target creature card from your graveyard to your hand.\n −3: Destroy target creature. Its controller loses 2 life.\n −7: Target opponent loses 2 life for each creature card in their graveyard.",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Liliana"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "4",
        abilities: [
            {
                id: "liliana_dm_plus1",
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '1' }],
                activeZone: ZoneRequirement.Battlefield,
                targetDefinition: {
                    type: TargetType.CardInGraveyard,
                    count: 1,
                    minCount: 0,
                    restrictions: [{ type: 'Creature' }, 'graveyard', 'yours']
                },
                effects: [{
                    type: EffectType.ReturnToHand,
                    targetMapping: 'TARGET_1'
                }],
                oracleText: "+1: Return up to one target creature card from your graveyard to your hand."
            },
            {
                id: "liliana_dm_minus3",
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-3' }],
                activeZone: ZoneRequirement.Battlefield,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    minCount: 1,
                    restrictions: [{ type: 'Creature' }]
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: 'TARGET_1'
                    },
                    {
                        type: EffectType.LoseLife,
                        targetMapping: 'TARGET_1_CONTROLLER',
                        amount: 2
                    }
                ],
                oracleText: "−3: Destroy target creature. Its controller loses 2 life."
            },
            {
                id: "liliana_dm_minus7",
                type: AbilityType.Activated,
                costs: [{ type: 'Loyalty', value: '-7' }],
                activeZone: ZoneRequirement.Battlefield,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1,
                    minCount: 1,
                    restrictions: ['opponent']
                },
                effects: [{
                    type: EffectType.LoseLife,
                    targetMapping: 'TARGET_1',
                    amount: (state: any, source: any) => {
                        const stackObj = state.stack.find((s: any) => s.sourceId === source.id && s.abilityIndex !== undefined);
                        const targetId = stackObj?.targets?.[0];
                        const player = state.players[targetId];
                        return (player?.graveyard?.filter((c: any) => c.definition.types.some((t: string) => t.toLowerCase() === 'creature')).length || 0) * 2;
                    }
                }],
                oracleText: "−7: Target opponent loses 2 life for each creature card in their graveyard."
            }
        ]
    }
};
