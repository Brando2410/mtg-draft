import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ArchfiendsVessel: CardDefinition = {
    name: "Archfiend's Vessel",
    manaCost: "{B}",

    oracleText: "Lifelink\nWhen Archfiend's Vessel enters the battlefield, if it entered from your graveyard or you cast it from your graveyard, exile it. If you do, create a 5/5 black Demon creature token with flying.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Lifelink"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: 'ENTERED_FROM_GRAVEYARD_OR_CAST_FROM_GRAVEYARD',
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Self },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Demon',
                        power: "5",
                        toughness: "5",
                        colors: ['B'],
                        types: ['Creature'],
                        subtypes: ['Demon'],
                        keywords: ['Flying'],

                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "83437022-ba00-4370-83c2-ce1260336fcc",
    image_url: "https://cards.scryfall.io/normal/front/8/3/83437022-ba00-4370-83c2-ce1260336fcc.jpg?1594735964",
    rarity: "uncommon"
};

