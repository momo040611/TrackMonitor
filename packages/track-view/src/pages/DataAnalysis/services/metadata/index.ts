export interface DataDictionaryItem {
    field: string
    type: string
    description: string
    required: boolean
}

export interface TagItem {
    name: string
    category: string
    color: string
}

export interface ConfigItem {
    key: string
    value: string
    description: string
}

export interface MetadataStateSnapshot {
    dictionary: DataDictionaryItem[]
    tags: TagItem[]
    configs: ConfigItem[]
}

export function loadInitialMetadata(): MetadataStateSnapshot {
    return {
        dictionary: [
            { field: 'userId', type: 'string', description: '用户唯一标识', required: true },
            { field: 'event', type: 'string', description: '事件名称，如 click/view', required: true },
            { field: 'value', type: 'number', description: '事件相关数值，如耗时或分值', required: false },
            { field: 'timestamp', type: 'ISODate', description: '事件发生时间', required: true },
        ],
        tags: [
            { name: '性能', category: '类型', color: 'geekblue' },
            { name: '行为', category: '类型', color: 'green' },
            { name: '错误', category: '类型', color: 'red' },
        ],
        configs: [
            { key: 'retention.days', value: '30', description: '默认数据保留天数' },
            { key: 'timezone', value: 'Asia/Shanghai', description: '分析时区配置' },
        ],
    }
}
