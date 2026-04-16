import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MagmabloodArchaic: CardDefinition = {
    name: "Magmablood Archaic",
    manaCost: "{2/R}{2/R}{2/R}",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: ["Trample", "Reach"],
    power: "2",
    toughness: "2",
    oracleText: "Trample, reach\nConverge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.\nWhenever you cast an instant or sorcery spell, creatures you control get +1/+0 until end of turn for each color of mana spent to cast that spell.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    amount: 'CONVERGE_AMOUNT',
                    counterType: 'p1p1',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state, event, trigger) => {
                if (event.playerId !== trigger.controllerId) return false;
                const card = event.data?.card || event.data?.object;
                return card?.definition.types.some((t: string) => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery');
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 'CONVERGE_AMOUNT', // The engine needs to know this refers to the TRIGGERING spell's converge
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ],
};





