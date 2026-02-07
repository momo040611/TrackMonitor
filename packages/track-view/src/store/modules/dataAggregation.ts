export interface DataAggregationState {
    loading: boolean
}

export type DataAggregationAction = { type: 'setLoading'; payload: boolean }

export const dataAggregationInitialState: DataAggregationState = {
    loading: false,
}

export function dataAggregationReducer(
    state: DataAggregationState,
    action: DataAggregationAction,
): DataAggregationState {
    if (action.type === 'setLoading') {
        return { ...state, loading: action.payload }
    }
    return state
}
