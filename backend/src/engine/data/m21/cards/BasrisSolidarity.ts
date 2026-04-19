import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const BasrisSolidarity: CardDefinition = {

    name: "Basri's Solidarity",
    manaCost: "{1}{W}",
    scryfall_id: "c2e6fdc0-bdd4-4bba-b8f1-bbc8dfad038e",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c2e6fdc0-bdd4-4bba-b8f1-bbc8dfad038e.jpg?1594734810",
    oracleText: "Put a +1/+1 counter on each creature you control.",
    colors: ["W"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{ type: EffectType.AddCounters, amount: 1, counterType: '+1/+1', targetMapping: TargetMapping.AllCreaturesYouControl }]
        }
    ]

};

