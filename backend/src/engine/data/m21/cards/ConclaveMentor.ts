import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ConclaveMentor: CardDefinition = {
    name: "Conclave Mentor",
    manaCost: "{G}{W}",
    scryfall_id: "a328a93a-e720-46d5-a190-cc65d1c90cea",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a328a93a-e720-46d5-a190-cc65d1c90cea.jpg?1594737354",
    oracleText: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on that creature instead.\nWhen this creature dies, you gain life equal to its power.",
    colors: ["G", "W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Centaur", "Cleric"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Replacement,
            replacesEvent: TriggerEvent.CountersAdded,
            condition: 'TargetIsCreatureYouControlAndCounterIsP1P1',
            effects: [{ type: EffectType.ModifyCountersAmount, amount: 1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: 'SelfDied',
            effects: [{ 
                type: EffectType.GainLife, 
                amount: DynamicAmount.Power, 
                targetMapping: TargetMapping.Controller 
            }]
        }
    ]
};
