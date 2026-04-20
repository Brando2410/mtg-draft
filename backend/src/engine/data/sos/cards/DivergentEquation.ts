import { AbilityType, CardDefinition, EffectType, Restriction, SelectionType, TargetType, Zone } from '@shared/engine_types';

export const DivergentEquation: CardDefinition = {
    name: "Divergent Equation",
    manaCost: "{X}{X}{U}",
    scryfall_id: "0d3c01f6-6c17-488b-b1e1-e6a88e6f1f3b",
    image_url: "https://cards.scryfall.io/png/front/e/2/e296839e-9905-4f40-8488-842245ae147c.png?1773176722",
    colors: ["U"],
    types: ["Instant"],
    exileOnResolution: true,
    oracleText: "Return up to X target instant and/or sorcery cards from your graveyard to your hand.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    label: "Select up to X instant/sorcery cards to return to your hand",
                    selectionType: SelectionType.Search,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        minCount: 0,
                        count: 'X' as any,
                        restrictions: [
                            Restriction.InstantOrSorcery,
                            Restriction.YouOwn
                        ]
                    }
                }
            ]
        }
    ]
};
