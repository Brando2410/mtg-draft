import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const EcologicalAppreciation: CardDefinition = {
        name: "Ecological Appreciation",
        manaCost: "{X}{G}{G}{G}",

        colors: ['G'],
        types: ["Sorcery"],
        oracleText: "Search your library and graveyard for up to four creature cards with different names that each have mana value X or less and reveal them. An opponent chooses two of those cards. Shuffle the chosen cards into your library and put the rest onto the battlefield. Exile Ecological Appreciation.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        label: "Search for 4 creatures with different names",
                        zone: Zone.Hand, // Temporary zone for choice,
                        amount: 4,
                        restrictions: [
                            'Creature', 
                            'DifferentNames', 
                            'mv_le_x'
                        ],
                        reveal: true,
                        next: {
                            type: EffectType.Choice,
                            label: "Opponent chooses two to shuffle back",
                            playerIdMapping: TargetMapping.TargetOpponent,
                            selectionPool: TargetMapping.SelectedCards,
                            minChoices: 2,
                            maxChoices: 2,
                            effects: [
                                { type: EffectType.MoveToZone, zone: Zone.Library, shuffle: true, targetMapping: TargetMapping.SelectedCards },
                                { type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.RemainingLookingCards }
                            ]
                        }
                    },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ],
    scryfall_id: "115f3d72-1aaf-4237-91b9-389256e5e5c8",
    image_url: "https://cards.scryfall.io/normal/front/1/1/115f3d72-1aaf-4237-91b9-389256e5e5c8.jpg?1624592652",
    rarity: "mythic"
};

