import type { InteractionMetadata, PendingAction } from '../types/state';

/**
 * Transient fields that should ALWAYS be moved to metadata to ensure 
 * consistent propagation and prevent root-level clutter.
 * Centralized here so ActionBuilder and getActionMeta are always in sync.
 */
export const TRANSIENT_FIELDS: (keyof InteractionMetadata)[] = [
    'isSpellCasting', 'isFreeCast', 'isMiracleCast', 'exileOnResolution', 'parentContext', 'stackObj',
    'manaSnapshot', 'restrictedSnapshot', 'producedMana', 'tappedLandIds',
    'isCopyTargeting', 'isCostTargeting', 'isResolutionX', 'xValueConfirmed',
    'discardAmount', 'xValue', 'lookingCards', 'targets', 'abilityIndex',
    'preSelectedChoice', 'spellCopyRef', 'confirmedAutoTap', 'isManaAbility',
    'effects', 'isManaChoiceToggle', 'hybridGroups', 'triggers',
    'nextPlayerIds', 'onFailureEffects', 'isOptionalDiscard', 'effectIndex', 'isResumption',
    'involvedIds', 'choiceEffects', 'declaredTargets', 'controllerId', 'exiledIds', 'chosenName', 'nextTriggersToStack',
    'maxChoices', 'minChoices', 'allowDuplicates', 'parentStackId', 'parentSourceId', 'isMulliganPutBack', 'isSacrificeSequence', 'isDiscardSequence', 'isChoiceSequence'
];

/**
 * Canonical accessor for action metadata.
 * Merges data.metadata over data root, so metadata always wins.
 * This lets us migrate writes incrementally without breaking reads.
 */
export function getActionMeta(action: PendingAction | undefined): InteractionMetadata {
    if (!action?.data) return {};
    
    const d = action.data as any;
    const m = d.metadata || {};
    
    // Dynamically build the metadata object based on the registry
    const meta: any = {};
    TRANSIENT_FIELDS.forEach(field => {
        meta[field] = m[field] ?? d[field];
    });

    // Special case for sourceMV which is calculated or passed manually sometimes
    if (m.sourceMV !== undefined || d.sourceMV !== undefined) {
        meta.sourceMV = m.sourceMV ?? d.sourceMV;
    }

    return meta as InteractionMetadata;
}
