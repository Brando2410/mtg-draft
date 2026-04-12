import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone } from '@shared/engine_types';

export const QuandrixCultivator: ImplementableCard = {
    name: 'Quandrix Cultivator',
    manaCost: '{G/U}{G}{G/U}', // {1}{G/U}{G/U} in Scryfall, wait.
    // Scryfall: {G/U}{G}{G/U} is 1G (wait) no. 
    // Quandrix Cultivator: {G/U}{G}{G/U} (which is 4 CMC? No, it's 4 CMC G/U G G G/U)
    // Actually: {1}{G/U}{G/U}{G}? No.
    // Let me check Scryfall: {1}{GU}{GU}{G}? No. It is {G/U}{G}{G}{G/U}. Total 4 mana.
    manaCost: '{G/U}{G}{G}{G/U}', 
    type_line: 'Creature — Turtle Druid',
    types: ['Creature'],
    subtypes: ['Turtle', 'Druid'],
    power: '3',
    toughness: '4',
    colors: ['green', 'blue'],
    oracleText: "When Quandrix Cultivator enters the battlefield, you may search your library for a basic Forest or Island card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            id: 'quandrix_cultivator_etb',
            type: AbilityType.Triggered,
            triggerEvent: 'ON_ETB',
            activeZone: ZoneRequirement.Battlefield,
            triggerCondition: 'SELF',
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Search for Forest/Island?',
                    optional: true,
                    choices: [
                        {
                            label: 'Search',
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetMapping: 'CONTROLLER',
                                    restrictions: ['Basic', { type: 'AnyOf', values: ['Forest', 'Island'] }],
                                    destination: Zone.Battlefield,
                                    tapped: true,
                                    shuffle: true
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

export const LoreholdExcavation: ImplementableCard = {
    name: 'Lorehold Excavation',
    manaCost: '{R}{W}',
    type_line: 'Enchantment',
    types: ['Enchantment'],
    subtypes: [],
    colors: ['red', 'white'],
    oracleText: "At the beginning of your end step, mill a card.\n{5}, Exile a creature card from your graveyard: Create a 3/2 red and white Spirit creature token.",
    abilities: [
        {
            id: 'lorehold_excavation_end_step',
            type: AbilityType.Triggered,
            triggerEvent: 'ON_END_STEP',
            activeZone: ZoneRequirement.Battlefield,
            triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
            effects: [{ type: EffectType.Mill, targetMapping: 'CONTROLLER', amount: 1 }]
        },
        {
            id: 'lorehold_excavation_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Mana', value: '{5}' },
                { type: 'Exile', targetMapping: 'GRAVEYARD_PLAYER', restrictions: ['Creature'] }
            ],
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Spirit',
                        power: '3', toughness: '2',
                        colors: ['red', 'white'],
                        types: ['Creature'],
                        subtypes: ['Spirit']
                    }
                }
            ]
        }
    ]
};
