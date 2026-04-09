import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SpeakeroftheHeavens: Record<string, ImplementableCard> = {
    "Speaker of the Heavens": {
        name: "Speaker of the Heavens",
        manaCost: "{W}",
        oracleText: "Vigilance, lifelink\n{T}: Create a 4/4 white Angel creature token with flying. Activate only if you have at least 7 more life than your starting life total and only as a sorcery.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "1",
        toughness: "1",
        keywords: ["Vigilance"],
        abilities: [
            {
                id: "speaker_heavens_angel",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                triggerCondition: (state: any) => state.players[state.activePlayerId].life >= 27, // 20 + 7
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Angel', power: '4', toughness: '4', colors: ['W'], types: ['Creature'], subtypes: ['Angel'], keywords: ['Flying'] }, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
