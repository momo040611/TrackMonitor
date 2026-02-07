import type {
    MetadataStateSnapshot,
    DataDictionaryItem,
    TagItem,
    ConfigItem,
} from '../../pages/DataAnalysis/services/metadata'

export interface MetadataState extends MetadataStateSnapshot { }

export type MetadataAction =
    | { type: 'setAll'; payload: MetadataStateSnapshot }
    | { type: 'addDictionary'; payload: DataDictionaryItem }
    | { type: 'removeDictionary'; payload: string }
    | { type: 'addTag'; payload: TagItem }
    | { type: 'removeTag'; payload: string }
    | { type: 'addConfig'; payload: ConfigItem }
    | { type: 'removeConfig'; payload: string }

export const metadataInitialState: MetadataState = {
    dictionary: [],
    tags: [],
    configs: [],
}

export function metadataReducer(state: MetadataState, action: MetadataAction): MetadataState {
    if (action.type === 'setAll') {
        return { ...state, ...action.payload }
    }
    if (action.type === 'addDictionary') {
        return { ...state, dictionary: [...state.dictionary, action.payload] }
    }
    if (action.type === 'removeDictionary') {
        return {
            ...state,
            dictionary: state.dictionary.filter((item) => item.field !== action.payload),
        }
    }
    if (action.type === 'addTag') {
        return { ...state, tags: [...state.tags, action.payload] }
    }
    if (action.type === 'removeTag') {
        return { ...state, tags: state.tags.filter((item) => item.name !== action.payload) }
    }
    if (action.type === 'addConfig') {
        return { ...state, configs: [...state.configs, action.payload] }
    }
    if (action.type === 'removeConfig') {
        return { ...state, configs: state.configs.filter((item) => item.key !== action.payload) }
    }
    return state
}
