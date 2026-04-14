import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const TorrentSculptor: CardDefinition = {
        name: "Torrent Sculptor",
        manaCost: "{2}{U}{R}",
        colors: ["U", "R"],
        types: ["Creature"],
        subtypes: ["Elemental", "Lizard"],
        power: "2",
        toughness: "2",
        keywords: ["Ward {2}"],
        oracleText: "Ward {2}\nWhen Torrent Sculptor enters the battlefield, you may exile an instant or sorcery card from your graveyard. If you do, put a +1/+1 counter on Torrent Sculptor for each mana value of the exiled card.",
        faces: [
            {
                name: "Torrent Sculptor",
                manaCost: "{2}{U}{R}",
                colors: ["U", "R"],
                types: ["Creature"],
                subtypes: ["Elemental", "Lizard"],
                power: "2",
                toughness: "2",
                keywords: ["Ward {2}"],
                oracleText: "Ward {2}\nWhen Torrent Sculptor enters the battlefield, you may exile an instant or sorcery card from your graveyard. If you do, put a +1/+1 counter on Torrent Sculptor for each mana value of the exiled card.",
                abilities: [{
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    effects: [{
                        type: EffectType.Choice,
                        label: "Exile instant/sorcery for counters?",
                        optional: true,
                        choices: [{
                            label: "Exile",
                            effects: [{
                                type: EffectType.Exile,
                                sourceZone: Zone.Graveyard,
                                restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }],
                                storeMV: 'SAVED_MV'
                            }, {
                                type: EffectType.AddCounters,
                                counterType: 'P1P1',
                                amount: DynamicAmount.SavedMV,
                                targetMapping: TargetMapping.Self
                            }]
                        }]
                    }]
                }]
            },
            {
                name: "Flamethrower Sonata",
                manaCost: "{1}{R}",
                colors: ["R"],
                types: ["Sorcery"],
                oracleText: "As an additional cost to cast this spell, discard a card. Flamethrower Sonata deals damage to target creature or planeswalker equal to 2 plus the mana value of the discarded card. If an instant or sorcery card was discarded this way, draw a card.",
                abilities: [{
                    type: AbilityType.Spell,
                    costs: [{ type: 'Discard', value: 1 }],
                    targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }] },
                    effects: [
                        { type: EffectType.DealDamage, amount: DynamicAmount.TwoPlusDiscardedMV, targetMapping: TargetMapping.Target1 },
                        { type: EffectType.Choice, condition: 'IS_INSTANT_OR_SORCERY_DISCARDED', choices: [{ label: 'Draw', effects: [{ type: EffectType.DrawCards, amount: 1 }] }] }
                    ]
                }]
            }
        ]
    };
