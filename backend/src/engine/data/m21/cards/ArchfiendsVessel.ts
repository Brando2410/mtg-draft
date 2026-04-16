import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ArchfiendsVessel: CardDefinition = {

    name: "Archfiend's Vessel",
    manaCost: "{B}",
    oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, if it entered from your graveyard or you cast it from your graveyard, exile it. If you do, create a 5/5 black Demon creature token with flying.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Lifelink"],
    abilities: [
        {
            id: "archfiend_vessel_etb",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: ZoneRequirement.Battlefield,
            condition: (state: any, event: any, source: any) => {
                const obj = event.data?.object;
                return event.sourceZone === 'Graveyard' || (event.sourceZone === 'Stack' && obj?.lastNonStackZone === 'Graveyard');
            },
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Self },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Demon', power: '5', toughness: '5', colors: ['B'],
                        types: ['Creature'], subtypes: ['Demon'], keywords: ['Flying'],
                        image_url: 'https://cards.scryfall.io/large/front/b/8/b8fd1237-674e-4e45-813c-ccaa689ec170.jpg'
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]

};


