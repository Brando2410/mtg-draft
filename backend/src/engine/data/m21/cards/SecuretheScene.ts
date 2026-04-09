import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SecuretheScene: Record<string, ImplementableCard> = {
    "Secure the Scene": {
        name: "Secure the Scene",
        manaCost: "{4}{W}",
        oracleText: "Exile target nonland permanent. Its controller creates a 1/1 white Soldier creature token.",
        colors: ["white"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "secure_scene_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Nonland'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    {
                        type: 'CreateToken',
                        tokenBlueprint: {
                            name: 'Soldier',
                            power: '1',
                            toughness: '1',
                            colors: ['W'],
                            types: ['Creature'],
                            subtypes: ['Soldier'],
                            image_url: 'https://cards.scryfall.io/large/front/d/0/d003cc2e-6e47-49f3-8f0a-b3287667bf97.jpg'
                        },
                        targetMapping: 'TARGET_1_CONTROLLER'
                    }
                ]
            }
        ]
    }
};
