/**
 * Utility for generating unique IDs within the engine.
 * Centralizing this ensures consistency across Spells, Triggers, and Effects.
 */
export class IdUtils {
    /**
     * Generates a unique string ID with an optional prefix.
     * Uses a combination of timestamp and random characters for collision safety.
     * Format: [prefix]_[timestamp]_[random]
     */
    public static generateId(prefix: string = 'obj'): string {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 7);
        return `${prefix}_${timestamp}_${randomStr}`;
    }

    public static generateStackId(): string {
        return this.generateId('stack');
    }

    public static generateAbilityId(): string {
        return this.generateId('ability');
    }

    public static generateCopyId(): string {
        return this.generateId('copy');
    }

    public static generateCardCopyId(): string {
        return this.generateId('card_copy');
    }

    public static generateTriggerId(): string {
        return this.generateId('trigger');
    }

    public static generateEffectId(type: string = 'eff'): string {
        return this.generateId(`floating_${type}`);
    }
}
