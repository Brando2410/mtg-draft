import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
                        zone: Zone.Hand, // Temporary zone for choice
                        amount: 4,
                        restrictions: [
                            { type: 'Type', value: 'Creature' }, 
                            { type: 'DifferentNames' }, 
                            { type: 'Attribute', attribute: 'ManaValue', value: DynamicAmount.X, comparison: 'LE' }
                        ],
                        reveal: true,
                        next: {
                            type: EffectType.Choice,
                            label: "Opponent chooses two to shuffle back",
                            playerIdMapping: TargetMapping.TargetOpponent,
                            targetIdMapping: TargetMapping.SelectedCards,
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
        ]
    };
