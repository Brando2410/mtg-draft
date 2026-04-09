import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ConspicuousSnoop: Record<string, ImplementableCard> = {
    "Conspicuous Snoop": {
        name: "Conspicuous Snoop",
        manaCost: "{R}{R}",
        oracleText: "Play with the top card of your library revealed.\nYou may cast Goblin spells from the top of your library.\nAs long as the top card of your library is a Goblin card, this creature has all activated abilities of that card.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Goblin","Rogue"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "snoop_reveal_top",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'PlayWithTopCardRevealed', targetMapping: 'CONTROLLER' }]
            },
            {
                id: "snoop_cast_goblins",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'AllowCastFromTop', restrictions: ['Goblin'], targetMapping: 'SELF' }]
            },
            {
                id: "snoop_gain_abilities",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'GainAbilitiesOfTopCard', condition: 'TOP_CARD_IS_GOBLIN', targetMapping: 'SELF' }]
            }
        ]
    }
};
