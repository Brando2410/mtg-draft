import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, Zone, GameObject } from '@shared/engine_types';

export const ZimonesExperiment: CardDefinition = {
    name: "Zimone's Experiment",
    manaCost: "{3}{G}",
    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Look at the top five cards of your library. You may reveal up to two creature and/or land cards from among them, then put the rest on the bottom of your library in a random order. Put all land cards revealed this way onto the battlefield tapped and put all creature cards revealed this way into your hand.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    targetMapping: TargetMapping.Controller,
                    fromTop: 5,
                    reveal: true,
                    selectionType: 'ANY',
                    amount: 2,
                    restrictions: [Restriction.CreatureOrLand],
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    onSelected: (card: GameObject) => {
                        const types = card.definition.types.map((t: string) => t.toLowerCase());
                        if (types.includes('land')) {
                            return [{ type: EffectType.MoveToZone, targetIds: [card.id], zone: Zone.Battlefield, tapped: true }];
                        }
                        if (types.includes('creature')) {
                            return [{ type: EffectType.MoveToZone, targetIds: [card.id], zone: Zone.Hand }];
                        }
                        return [];
                    }
                }
            ]
        }
    ],
    scryfall_id: "a6597852-4267-4ea6-a391-f927e4833be2",
    image_url: "https://cards.scryfall.io/normal/front/a/6/a6597852-4267-4ea6-a391-f927e4833be2.jpg?1775938156",
    rarity: "uncommon"
};

