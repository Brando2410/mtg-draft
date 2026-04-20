import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const ConspicuousSnoop: CardDefinition = {
    name: "Conspicuous Snoop",
    manaCost: "{R}{R}",
    scryfall_id: "5d878dab-5ed2-4ef3-b2c7-472290892854",
    image_url: "https://cards.scryfall.io/normal/front/5/d/5d878dab-5ed2-4ef3-b2c7-472290892854.jpg?1616182104",
    oracleText: "Play with the top card of your library revealed.\nYou may cast Goblin spells from the top of your library.\nAs long as the top card of your library is a Goblin card, Conspicuous Snoop has all activated abilities of that card.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Goblin", "Rogue"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.PlayWithTopCardRevealed, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.AllowPlayFromTop,
                restrictions: [Restriction.Goblin],
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Static,
            condition: 'TOP_CARD_IS_GOBLIN',
            effects: [{ type: EffectType.GainAbilitiesOfTopCard, targetMapping: TargetMapping.Self }]
        }
    ]
};
