import {
    ActionData,
    TargetingActionData,
    ModalActionData,
    BatchActionData,
    XChoiceActionData,
    CostActionData
} from '@shared/engine_types';

export function isTargetingData(data: ActionData): data is TargetingActionData {
    return 'targetDefinitions' in data || 'selectedTargets' in data;
}

export function isModalData(data: ActionData): data is ModalActionData {
    const meta = data?.metadata || {};
    return Array.isArray(data?.choices) || meta?.isManaChoiceToggle === true || data?.isManaChoiceToggle === true;
}

export function isBatchData(data: ActionData): data is BatchActionData {
    const meta = data.metadata || {};
    return 'discardAmount' in data || 'nextPlayerIds' in data || 'discardAmount' in meta || 'nextPlayerIds' in meta;
}

export function isXChoiceData(data: ActionData): data is XChoiceActionData {
    const meta = data.metadata || {};
    return 'isResolutionX' in data || 'isResolutionX' in meta;
}

export function isCostData(data: ActionData): data is CostActionData {
    const meta = data.metadata || {};
    return 'remainingCosts' in data || 'isManaChoiceToggle' in data || 'remainingCosts' in meta || 'isManaChoiceToggle' in meta;
}
