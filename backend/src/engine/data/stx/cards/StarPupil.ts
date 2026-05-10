import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const StarPupil: CardDefinition = {
    name: 'Star Pupil',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Wizard'],
    power: "0",
    toughness: "0",
    oracleText: 'Star Pupil enters the battlefield with a +1/+1 counter on it.\nWhen Star Pupil dies, put its counters on target creature you control.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.EntersWithCounters, counterType: '+1/+1', amount: 1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            }],
            effects: [{ type: EffectType.MoveCounters, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "99e9318f-2e17-4b6e-895f-c17cd5d0d282",
    image_url: "https://cards.scryfall.io/normal/front/9/9/99e9318f-2e17-4b6e-895f-c17cd5d0d282.jpg?1624589792",
    rarity: "common"
};

