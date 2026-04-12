import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TriggerEvent } from '@shared/engine_types';

export const MageHunter: ImplementableCard = {
    name: 'Mage Hunter',
    manaCost: '{3}{B}',
    type_line: 'Creature — Horror',
    types: ['Creature'],
    subtypes: ['Horror'],
    power: '3',
    toughness: '4',
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Whenever an opponent casts or copies an instant or sorcery spell, they lose 1 life.',
    abilities: [
        {
            id: 'mage_hunter_opponent_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.MagecraftOpponent,
            effects: [
                {
                    type: EffectType.LoseLife,
                    targetMapping: 'EVENT_PLAYER', // The opponent who cast/copied the spell
                    amount: 1
                }
            ]
        }
    ]
};
