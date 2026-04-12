import { ImplementableCard, AbilityType, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone, DurationType } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH: RARES & MYTHICS 2
 */

export const BeledrosWitherbloom: ImplementableCard = {
    name: 'Beledros Witherbloom',
    manaCost: '{5}{B}{G}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '4',
    toughness: '4',
    keywords: ['Flying'],
    colors: ['black', 'green'],
    oracleText: 'Flying\nAt the beginning of each upkeep, create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."\nPay 10 life: Untap all lands you control. Activate only as a sorcery and only once each turn.',
    abilities: [
        {
            id: 'beledros_upkeep_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Upkeep,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Pest',
                        power: '1',
                        toughness: '1',
                        colors: ['black', 'green'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        abilities: [{
                            id: 'pest_death_trigger',
                            type: AbilityType.Triggered,
                            activeZone: ZoneRequirement.Battlefield,
                            triggerEvent: TriggerEvent.Death,
                            triggerCondition: 'SELF',
                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
                        }]
                    }
                }
            ]
        },
        {
            id: 'beledros_untap_ability',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Life', amount: 10 }],
            limitPerTurn: 1,
            activatedOnlyAsSorcery: true,
            effects: [{ type: EffectType.Untap, targetMapping: 'ALL_LANDS_YOU_CONTROL' }]
        }
    ]
};

export const TanazirQuandrix: ImplementableCard = {
    name: 'Tanazir Quandrix',
    manaCost: '{2}{G}{G}{U}',
    type_line: 'Legendary Creature — Elder Dragon',
    types: ['Creature'],
    subtypes: ['Elder', 'Dragon'],
    supertypes: ['Legendary'],
    power: '4',
    toughness: '4',
    keywords: ['Flying', 'Trample'],
    colors: ['green', 'blue'],
    oracleText: 'Flying, trample\nWhen Tanazir Quandrix enters the battlefield, double the number of +1/+1 counters on target creature you control.\nWhenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become Tanazir Quandrix\'s power and toughness until end of turn.',
    abilities: [
        {
            id: 'tanazir_etb_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature', 'YouControl']
            },
            effects: [{
                type: EffectType.AddCounters,
                targetMapping: 'TARGET_1',
                value: '+1/+1',
                amount: (state: any, source: any, targets: any) => {
                    const target = state.battlefield.find((obj: any) => obj.id === targets[0]);
                    return target?.counters?.['+1/+1'] || 0;
                }
            }]
        },
        {
            id: 'tanazir_attack_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Attack,
            triggerCondition: 'SELF',
            optional: true,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: DurationType.UntilEndOfTurn,
                layer: 7,
                sublayer: 'b', // Base P/T
                powerSet: (state: any, source: any) => {
                    const self = state.battlefield.find((obj: any) => obj.id === source.sourceId);
                    return self?.effectiveStats?.power || 0;
                },
                toughnessSet: (state: any, source: any) => {
                    const self = state.battlefield.find((obj: any) => obj.id === source.sourceId);
                    return self?.effectiveStats?.toughness || 0;
                },
                targetMapping: 'OTHER_CREATURES_YOU_CONTROL'
            }]
        }
    ]
};

export const CodieVociferousCodex: ImplementableCard = {
    name: 'Codie, Vociferous Codex',
    manaCost: '{3}',
    type_line: 'Legendary Artifact Creature — Construct',
    types: ['Creature', 'Artifact'],
    subtypes: ['Construct'],
    supertypes: ['Legendary'],
    power: '1',
    toughness: '4',
    keywords: [],
    colors: [],
    oracleText: 'You can\'t cast permanent spells.\n{4}, {T}: Add {W}{U}{B}{R}{G}. When you cast your next spell this turn, exile cards from the top of your library until you exile an instant or sorcery card with mana value less than that spell\'s mana value. You may cast it without paying its mana cost. Put the rest on the bottom of your library in a random order.',
    abilities: [
        {
            id: 'codie_restriction',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                restrictions: ['CantCastPermanentSpells'],
                targetMapping: 'CONTROLLER'
            }]
        },
        {
            id: 'codie_mana_ability',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{4}' }, { type: 'Tap' }],
            effects: [
                { type: EffectType.AddMana, value: '{W}{U}{B}{R}{G}' },
                { 
                    type: EffectType.CreateDelayedTrigger,
                    triggerEvent: TriggerEvent.CastSpell,
                    triggerCondition: (state: any, event: any, source: any) => event.controllerId === source.controllerId,
                    duration: DurationType.UntilEndOfTurn,
                    effects: [{
                        type: EffectType.SearchLibrary,
                        selectionType: 'TopN',
                        filter: (state: any, event: any) => ({
                            type: 'InstantOrSorcery',
                            mv_lt: event.manaValue
                        }),
                        destination: Zone.Stack,
                        isFreeCast: true,
                        remainderZone: Zone.Library,
                        remainderPosition: 'bottom',
                        shuffleRemainder: true
                    }]
                }
            ]
        }
    ]
};

export const ExtusOriqOverlord: ImplementableCard = {
    name: 'Extus, Oriq Overlord // Awaken the Blood Avatar',
    manaCost: '{1}{W}{B}{B} // {6}{B}{R}',
    type_line: 'Legendary Creature — Human Warlock // Sorcery',
    types: ['Creature', 'Sorcery'],
    subtypes: ['Human', 'Warlock'],
    supertypes: ['Legendary'],
    power: '2',
    toughness: '4',
    keywords: ['Double Strike'],
    colors: ['white', 'black', 'red'],
    oracleText: 'Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target creature card from your graveyard to your hand.\n----\nAs an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way.\nCreate a 3/6 black and red Avatar creature token with haste and "Whenever this creature attacks, each opponent sacrifices a creature and loses 3 life."',
    faces: [
        {
            name: 'Extus, Oriq Overlord',
            manaCost: '{1}{W}{B}{B}',
            type_line: 'Legendary Creature — Human Warlock',
            types: ['Creature'],
            subtypes: ['Human', 'Warlock'],
            power: '2',
            toughness: '4',
            keywords: ['Double Strike'],
            colors: ['white', 'black'],
            oracleText: 'Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target creature card from your graveyard to your hand.'
        },
        {
            name: 'Awaken the Blood Avatar',
            manaCost: '{6}{B}{R}',
            type_line: 'Sorcery',
            types: ['Sorcery'],
            subtypes: [],
            colors: ['black', 'red'],
            oracleText: 'As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way.\nCreate a 3/6 black and red Avatar creature token with haste and "Whenever this creature attacks, each opponent sacrifices a creature and loses 3 life."'
        }
    ],
    abilities: [
        {
            id: 'extus_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            targetDefinition: {
                type: TargetType.Card,
                count: 1,
                zone: Zone.Graveyard,
                restrictions: ['Creature', 'YouControl']
            },
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'TARGET_1' }]
        },
        {
            id: 'awaken_blood_avatar_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            additionalCosts: [{ type: 'SacrificeAnyNumber', reductionPerSacrifice: '{2}', restrictions: ['Creature'] }],
            effects: [{
                type: EffectType.CreateToken,
                amount: 1,
                tokenBlueprint: {
                    name: 'Avatar',
                    power: '3',
                    toughness: '6',
                    colors: ['black', 'red'],
                    types: ['Creature'],
                    subtypes: ['Avatar'],
                    keywords: ['Haste'],
                    abilities: [{
                        id: 'avatar_attack_trigger',
                        type: AbilityType.Triggered,
                        activeZone: ZoneRequirement.Battlefield,
                        triggerEvent: TriggerEvent.Attack,
                        triggerCondition: 'SELF',
                        effects: [
                            { type: EffectType.Sacrifice, targetMapping: 'EACH_OPPONENT', restrictions: ['Creature'] },
                            { type: EffectType.LoseLife, amount: 3, targetMapping: 'EACH_OPPONENT' }
                        ]
                    }]
                }
            }]
        }
    ]
};
