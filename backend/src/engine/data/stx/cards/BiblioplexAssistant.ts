import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BiblioplexAssistant: CardDefinition = {
    name: 'Biblioplex Assistant',
    manaCost: '{4}',
    colors: [],
    types: ['Artifact', 'Creature'],
    subtypes: ['Construct'],
    power: "2",
    toughness: "1",
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Biblioplex Assistant enters the battlefield, you may put target instant or sorcery card from your graveyard on top of your library.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                count: 1,
                type: TargetType.CardInGraveyard,
                restrictions: ['yours', 'instant_or_sorcery']
            },
            effects: [{
                type: EffectType.Choice,
                label: "Put card on top of library?",
                optional: true,
                choices: [{
                    label: "Move to Top",
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, targetMapping: TargetMapping.Target1, libraryPosition: 'top' }]
                }]
            }]
        }
    ]
  };


