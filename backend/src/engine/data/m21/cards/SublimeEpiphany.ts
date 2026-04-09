import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SublimeEpiphany: Record<string, ImplementableCard> = {
    "Sublime Epiphany": {
        name: "Sublime Epiphany",
        manaCost: "{4}{U}{U}",
        oracleText: "Choose one or more —\n• Counter target spell.\n• Counter target activated or triggered ability.\n• Return target nonland permanent to its owner's hand.\n• Create a token that's a copy of target creature you control.\n• Target player draws a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sublime_epiphany_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                multiMode: { type: 'CHOOSE_ONE_OR_MORE' },
                modes: [
                    { label: 'Counter target spell', targetDefinition: { type: 'Spell' }, effects: [{ type: 'CounterSpell', targetMapping: 'TARGET_1' }] },
                    { label: 'Counter target activated or triggered ability', targetDefinition: { type: 'Ability' }, effects: [{ type: 'CounterAbility', targetMapping: 'TARGET_1' }] },
                    { label: 'Return target nonland permanent to owner hand', targetDefinition: { type: 'Permanent', restrictions: ['Nonland'] }, effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }] },
                    { label: 'Create token copy of target creature', targetDefinition: { type: 'Permanent', restrictions: ['Creature', 'YouControl'] }, effects: [{ type: 'CreateTokenCopy', targetMapping: 'TARGET_1' }] },
                    { label: 'Target player draws a card', targetDefinition: { type: 'Player' }, effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'TARGET_1' }] }
                ]
            }
        ]
    }
};
