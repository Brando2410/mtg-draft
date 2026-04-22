import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const RenderSpeechless: CardDefinition = {
    name: "Render Speechless",
    manaCost: "{2}{W}{B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nPut two +1/+1 counters on up to one target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                {
                    type: TargetType.Opponent,
                },
                {
                    type: TargetType.Creature,
                    count: 1,
                    minCount: 0,
                }
            ],
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose a nonland card to discard',
                    targetMapping: TargetMapping.Target1,
                    selectionPool: TargetMapping.Target1HandRevealPick,
                    restrictions: [Restriction.NonLand],
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: TargetMapping.SelectedCard, isDiscard: true }]
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Target2,
                    amount: 2,
                    counterType: 'p1p1',
                }
            ]
        }
    ]
};
