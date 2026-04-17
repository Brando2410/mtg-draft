import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const AbigalePoetLaureateHeroicStanza: CardDefinition = {
    name: "Abigale, Poet Laureate // Heroic Stanza",
    manaCost: "{1}{W}{B} // {1}{W/B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Bird",
        "Bard"
    ],
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nWhenever you cast a creature spell, Abigale becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "2",
    toughness: "3",
    image_url: "https://cards.scryfall.io/png/front/7/7/77285d12-e658-4eb3-ba13-ff202afab9c8.png?1775938164",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'SPELL_IS_CREATURE',
            effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
        }
    ],
    preparedFace: {
        name: "Heroic Stanza",
        image_url: "https://cards.scryfall.io/png/front/7/7/77285d12-e658-4eb3-ba13-ff202afab9c8.png?1775938164",
        manaCost: "{1}{W/B}",
        colors: ["B", "W"],
        types: ["Sorcery"],
        oracleText: "Put a +1/+1 counter on target creature.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: TargetType.Creature },
                effects: [
                    {
                        type: EffectType.AddCounters,
                        amount: 1,
                        counterType: '+1/+1',
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
    
