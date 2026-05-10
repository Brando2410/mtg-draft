/**
 * Utility functions for MTG card logic to make it more human-readable.
 */

/**
 * Checks if a game object has a specific keyword (considering both base and buffs).
 */
export function hasKeyword(obj: any, keyword: string): boolean {
    const k = keyword.toLowerCase();
    const baseKeywords = obj.definition?.keywords || [];
    const addedKeywords = obj.effectiveStats?.abilitiesToAdd || [];
    
    return [
        ...baseKeywords,
        ...addedKeywords
    ].some((kw: any) => kw.toString().toLowerCase() === k);
}

/**
 * Counts permanents controlled by a player that have a specific keyword.
 */
export function countControlledWithKeyword(state: any, controllerId: string, keyword: string): number {
    return state.battlefield.filter((o: any) => 
        o.controllerId === controllerId && hasKeyword(o, keyword)
    ).length;
}

/**
 * Counts permanents controlled by a player that match a custom predicate.
 */
export function countControlled(state: any, controllerId: string, predicate: (obj: any) => boolean): number {
    return state.battlefield.filter((o: any) => 
        o.controllerId === controllerId && predicate(o)
    ).length;
}

/**
 * DSL for life gain/damage amounts.
 */
export const calculate = (multiplier: number) => ({
    perFlyingCreature: (state: any, source: any) => multiplier * countControlledWithKeyword(state, source.controllerId, 'Flying'),
    perKeyword: (keyword: string) => (state: any, source: any) => multiplier * countControlledWithKeyword(state, source.controllerId, keyword),
    perCreatureWithPower: (power: number) => (state: any, source: any) => {
        return multiplier * countControlled(state, source.controllerId, (o) => 
            o.definition.types.some((t: any) => t.toLowerCase() === 'creature') &&
            (o.effectiveStats?.power ?? 0) >= power
        );
    }
})
{
};

