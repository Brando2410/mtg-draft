import { AbilityType, Zone, EffectType, TargetType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const LilianaDeathMage: CardDefinition = {

    name: "Liliana, Death Mage",
    manaCost: "{4}{B}{B}",
    oracleText: "+1: Return up to one target creature card from your graveyard to your hand.\n −3: Destroy target creature. Its controller loses 2 life.\n −7: Target opponent loses 2 life for each creature card in their graveyard.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Liliana"],
    power: undefined,
    toughness: undefined,
    keywords: [],
    loyalty: "4",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '1' }],
            activeZone: Zone.Battlefield,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                minCount: 0,
                restrictions: ['Creature', 'YouControl']
            },
            effects: [{
                type: EffectType.ReturnToHand,
                targetMapping: TargetMapping.Target1
            }],
            oracleText: "+1: Return up to one target creature card from your graveyard to your hand."
        },
        {
            id: "liliana_dm_minus3",
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '-3' }],
            activeZone: Zone.Battlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                minCount: 1,
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.LoseLife,
                    targetMapping: TargetMapping.Target1Controller,
                    amount: 2
                }
            ],
            oracleText: "−3: Destroy target creature. Its controller loses 2 life."
        },
        {
            id: "liliana_dm_minus7",
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '-7' }],
            activeZone: Zone.Battlefield,
            targetDefinition: {
                type: TargetType.Player,
                count: 1,
                minCount: 1,
                restrictions: ['Opponent']
            },
            effects: [{
                type: EffectType.LoseLife,
                targetMapping: TargetMapping.Target1,
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
};
