import { AbilityType, CardDefinition, EffectType, GameState, PlayerId, Restriction, TargetMapping } from '@shared/engine_types';

/**
 * Pox Plague (SOS 0XX)
 */
export const PoxPlague: CardDefinition = {
    name: "Pox Plague",
    manaCost: "{B}{B}{B}{B}{B}",


    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Each player loses half their life, then discards half the cards in their hand, then sacrifices half the permanents they control of their choice. Round down each time.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LoseLife,
                    targetMapping: TargetMapping.EachPlayer,
                    amount: (state: GameState, source: any, targets: string[]) => {
                        const pid = targets[0] as PlayerId;
                        const player = state.players[pid];
                        return player ? Math.floor(player.life / 2) : 0;
                    }
                },
                {
                    type: EffectType.DiscardCards,
                    targetMapping: TargetMapping.EachPlayer,
                    amount: (state: GameState, source: any, targets: string[]) => {
                        const pid = targets[0] as PlayerId;
                        const player = state.players[pid];
                        return player ? Math.floor(player.hand.length / 2) : 0;
                    }
                },
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachPlayer,
                    restrictions: [Restriction.Permanent],
                    amount: (state: GameState, source: any, targets: string[]) => {
                        const pid = targets[0] as PlayerId;
                        const perms = state.battlefield.filter((o) => o.controllerId === pid);
                        return Math.floor(perms.length / 2);
                    }
                }
            ]
        }
    ],
    scryfall_id: "9c99c17b-ad3a-4859-97e8-469718b81cd9",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c99c17b-ad3a-4859-97e8-469718b81cd9.jpg?1775937566",
    rarity: "rare"
};

