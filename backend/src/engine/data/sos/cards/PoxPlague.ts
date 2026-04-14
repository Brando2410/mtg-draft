import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const PoxPlague: CardDefinition = {
    "name": "Pox Plague",
    "manaCost": "{B}{B}{B}{B}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Each player loses half their life, then discards half the cards in their hand, then sacrifices half the permanents they control of their choice. Round down each time.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    targetMapping: TargetMapping.EachPlayer,
                    choices: [
                        {
                            label: "Pox Plague resolution",
                            effects: [
                                {
                                    type: EffectType.LoseLife,
                                    targetMapping: TargetMapping.Target1,
                                    amount: (state: any, source: any, targets: string[]) => {
                                        const player = state.players[targets[0]];
                                        return player ? Math.floor(player.life / 2) : 0;
                                    }
                                },
                                {
                                    type: EffectType.DiscardCards,
                                    targetMapping: TargetMapping.Target1,
                                    amount: (state: any, source: any, targets: string[]) => {
                                        const player = state.players[targets[0]];
                                        return player ? Math.floor(player.hand.length / 2) : 0;
                                    }
                                },
                                {
                                    type: EffectType.Sacrifice,
                                    targetMapping: TargetMapping.Target1,
                                    restrictions: ['Permanent'],
                                    amount: (state: any, source: any, targets: string[]) => {
                                        const pId = targets[0];
                                        const perms = state.battlefield.filter((o: any) => o.controllerId === pId);
                                        return Math.floor(perms.length / 2);
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};


