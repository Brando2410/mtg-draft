import { GameState, GameObject, PlayerId } from '@shared/engine_types';

/**
 * Rules Engine Module: Restrictions (CR 101.2: "Cannot" always wins)
 */
export class RestrictionProcessor {

    public static isCastAllowed(state: GameState, playerId: PlayerId, card: GameObject): boolean {
        const restrictions = [
            ...state.ruleRegistry.restrictions,
            ...(state.ruleRegistry.continuousEffects.flatMap(e => e.restrictions || []))
        ];

        for (const r of restrictions) {
            // Check if restriction applies to this player
            if (r.targetControllerId && r.targetControllerId !== playerId) continue;
            
            // 1. Permanent Spell Restriction (Codie)
            if (r.type === 'CannotCastPermanentSpells') {
                const isPermanent = card.definition.types.some(t => 
                    ['Creature', 'Artifact', 'Enchantment', 'Planeswalker'].includes(t)
                );
                if (isPermanent) return false;
            }

            // 2. Named Card Restriction (Academic Probation)
            if (r.type === 'CannotCastNamedCard') {
                const namedCardName = state.turnState.namedCards?.[r.sourceId];
                if (namedCardName && card.definition.name.toLowerCase() === namedCardName.toLowerCase()) {
                    return false;
                }
            }

            // 3. Type-based Restriction (e.g. Meddling Mage logic placeholder)
            if (r.type === 'CannotCastType') {
                const restrictedType = (r as any).value;
                if (restrictedType && card.definition.types.includes(restrictedType)) {
                    return false;
                }
            }
        }

        return true;
    }
}
