import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofAbundanceRegrowth: CardDefinition = {
    name: "Emeritus of Abundance",
    manaCost: "{2}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Elf", "Druid"],
    power: "3",
    toughness: "4",
    keywords: ["Vigilance", "Prepared"],
    oracleText: "Vigilance\nThis creature enters prepared. Whenever this creature attacks, if you control eight or more lands, this creature becomes prepared.",
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
                targetDefinition: {
                    type: 'Card',
                    zone: Zone.Graveyard,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        zone: Zone.Hand,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
