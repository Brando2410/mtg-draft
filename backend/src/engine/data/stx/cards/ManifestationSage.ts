import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TriggerEvent } from '@shared/engine_types';

export const ManifestationSage: ImplementableCard = {
    name: 'Manifestation Sage',
    manaCost: '{G/U}{G/U}{G/U}{G/U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'When Manifestation Sage enters the battlefield, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of cards in your hand.',
    abilities: [
        {
            id: 'manifestation_sage_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'SELF',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: '0',
                        toughness: '0'
                    },
                    startingCounters: {
                        type: '+1/+1',
                        amount: 'CARDS_IN_HAND_COUNT'
                    }
                }
            ]
        }
    ]
};
