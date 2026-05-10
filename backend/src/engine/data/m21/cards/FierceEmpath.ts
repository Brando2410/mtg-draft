import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FierceEmpath: CardDefinition = {
    name: "Fierce Empath",
    manaCost: "{2}{G}",

    oracleText: "When this creature enters, you may search your library for a creature card with mana value 6 or greater, reveal it, put it into your hand, then shuffle.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Elf"],
    power: "1",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.Creature,
                        count: 1,
                        restrictions: [Restriction.ManaValue6OrGreater]
                    }],
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "17bc2af0-5a1d-4319-a285-6a15cf86be83",
    image_url: "https://cards.scryfall.io/normal/front/1/7/17bc2af0-5a1d-4319-a285-6a15cf86be83.jpg?1594736962",
    rarity: "common"
};

