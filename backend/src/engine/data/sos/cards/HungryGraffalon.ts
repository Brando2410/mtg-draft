import { CardDefinition } from '@shared/engine_types';
    export const HungryGraffalon: CardDefinition = {
    name: "Hungry Graffalon",
    manaCost: "{3}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Giraffe"
    ],
    keywords: ["Reach", "Increment"],
    oracleText: "Reach\nIncrement (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)",
    abilities: [],
    power: "3",
    toughness: "4"
};
    