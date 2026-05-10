import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
            targetDefinitions: [{
                count: 1,
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.YouControl, Restriction.InstantOrSorcery]
            }],
            effects: [{
                type: EffectType.Choice,
                label: "Put card on top of library?",
                optional: true,
                choices: [{
                    label: "Move to Top",
                    effects: [{
                        type: EffectType.MoveToZone,
                        zone: Zone.Library,
                        targetMapping: TargetMapping.Target1,
                        position: 'top'
                    }]
                }]
            }]
        }
    ],
    scryfall_id: "d74e1117-0196-4268-be97-a1e81b5dc90e",
    image_url: "https://cards.scryfall.io/normal/front/d/7/d74e1117-0196-4268-be97-a1e81b5dc90e.jpg?1624740545",
    rarity: "common"
};

