import { AbilityType, CardDefinition, EffectType, Restriction, SelectionType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const EmeritusofAbundanceRegrowth: CardDefinition = {
    name: "Emeritus of Abundance // Regrowth",
    manaCost: "{2}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Elf", "Druid"],
    keywords: ["Vigilance", "Prepared"],
    oracleText: "Vigilance\nThis creature enters prepared. Whenever this creature attacks, if you control eight or more lands, this creature becomes prepared.",
    power: "3",
    toughness: "4",
    entersPrepared: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'LAND_COUNT_GE:8',
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Regrowth",

        manaCost: "{1}{G}",
        colors: ["G"],
        types: ["Sorcery"],
        oracleText: "Return target card from your graveyard to your hand.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        zone: Zone.Hand,
                        label: "Select target card from your graveyard to return to your hand",
                        selectionType: SelectionType.Search,
                        targetDefinitions: [{
                            type: TargetType.CardInGraveyard,
                            count: 1,
                            restrictions: [Restriction.YouControl]
                        }]
                    }
                ]
            }
        ],

    },
    scryfall_id: "ac095763-6f4e-4d4e-9c99-414646368f8d",
    image_url: "https://cards.scryfall.io/png/front/d/7/d771fc5d-b9a1-4637-8241-3f54616b64af.png?1562202155",
    rarity: "mythic"
};

