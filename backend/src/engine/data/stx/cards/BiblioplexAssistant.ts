import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType, Zone } from '@shared/engine_types';

export const BiblioplexAssistant: ImplementableCard = {
    name: 'Biblioplex Assistant',
    manaCost: '{4}',
    type_line: 'Artifact Creature — Gargoyle',
    types: ['Artifact', 'Creature'],
    subtypes: ['Gargoyle'],
    power: '2',
    toughness: '1',
    keywords: ['Flying'],
    colors: [],
    supertypes: [],
    oracleText: 'Flying\nWhen Biblioplex Assistant enters, put up to one target instant or sorcery card from your graveyard on top of your library.',
    abilities: [
        {
            id: 'biblioplex_assistant_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    targetMapping: 'TARGET_1',
                    destination: Zone.Library,
                    libraryPosition: 'top'
                }
            ],
            targetDefinition: {
                type: 'CardInGraveyard',
                count: 1,
                optional: true,
                restrictions: ['instant_or_sorcery']
            }
        }
    ]
};
