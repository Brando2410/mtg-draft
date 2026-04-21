import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const VastlandsScavengerBindtoLife: CardDefinition = {
    name: "Vastlands Scavenger // Bind to Life",
    manaCost: "{1}{G}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Bear", "Druid"],
    keywords: ["Deathtouch", "Prepared"],
    oracleText: "Deathtouch\nThis creature enters prepared.",
    power: "4",
    toughness: "4",

    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/4/7/476b6a4d-cc05-4e98-8a45-a5c6582ec514.png?1775938136",
    preparedFace: {
        name: "Bind to Life",
        image_url: "https://cards.scryfall.io/png/front/4/7/476b6a4d-cc05-4e98-8a45-a5c6582ec514.png?1775938136",
        manaCost: "{4}{G}",
        colors: ["G"],
        types: ["Instant"],
        oracleText: "Mill seven cards. Then put a creature card from among them onto the battlefield.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.Mill, amount: 7, targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.Choice,
                        label: 'Choose a creature card to return to the battlefield',
                        selectionPool: TargetMapping.LastMilledIds,
                        targetDefinition: {
                            count: 1,
                            minCount: 0,
                            type: TargetType.Creature
                        },
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }]
                    }
                ]
            }
        ]
    }
};
