import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, TriggerEvent, TargetMapping } from '@shared/engine_types';

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
                eventMatch: TriggerEvent.EnterBattlefield,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Creature,
                            count: 1,
                            restrictions: ['MV_GE:6']
                        },
                        zone: Zone.Hand,
                        reveal: true,
                        optional: true,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};


