import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const FierceEmpath: Record<string, ImplementableCard> = {
    "Fierce Empath": {
        name: "Fierce Empath",
        manaCost: "{2}{G}",
        oracleText: "When this creature enters, you may search your library for a creature card with mana value 6 or greater, reveal it, put it into your hand, then shuffle.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elf"],
        power: "1",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "fierce_empath_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [
                    {
                        type: 'MoveToZone',
                        selectionType: 'Search',
                        sourceZones: [Zone.Library],
                        destination: Zone.Hand,
                        reveal: true,
                        shuffle: true,
                        optional: true,
                        restrictions: ['Creature', 'CMC >= 6'],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};


