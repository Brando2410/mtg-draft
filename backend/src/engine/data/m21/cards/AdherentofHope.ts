import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const AdherentofHope: CardDefinition = {
    name: "Adherent of Hope",
    manaCost: "{1}{W}",
    scryfall_id: "ce2bc7ad-458d-445e-a0a9-7897b596fdd0",
    image_url: "https://cards.scryfall.io/normal/front/c/e/ce2bc7ad-458d-445e-a0a9-7897b596fdd0.jpg?1596250018",
    oracleText: "At the beginning of combat on your turn, if you control a Basri planeswalker, put a +1/+1 counter on this creature.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: 'OUR_TURN_AND_CONTROL_BASRI_PLANESWALKER',
            effects: [{
                type: EffectType.AddCounters,
                amount: 1,
                counterType: '+1/+1',
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};
