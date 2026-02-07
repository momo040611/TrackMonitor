import type { CleaningResult, CleaningRule, RawRecord } from '../../pages/DataAnalysis/services/data-cleaning'

export interface DataCleaningState {
    rawData: RawRecord[]
    rules: CleaningRule | null
    result: CleaningResult | null
}

export type DataCleaningAction =
    | { type: 'setRawData'; payload: RawRecord[] }
    | { type: 'setRules'; payload: CleaningRule }
    | { type: 'setCleaningResult'; payload: CleaningResult | null }

export const dataCleaningInitialState: DataCleaningState = {
    rawData: [],
    rules: null,
    result: null,
}

export function dataCleaningReducer(state: DataCleaningState, action: DataCleaningAction): DataCleaningState {
    if (action.type === 'setRawData') {
        return { ...state, rawData: action.payload }
    }
    if (action.type === 'setRules') {
        return { ...state, rules: action.payload }
    }
    if (action.type === 'setCleaningResult') {
        return { ...state, result: action.payload }
    }
    return state
}
