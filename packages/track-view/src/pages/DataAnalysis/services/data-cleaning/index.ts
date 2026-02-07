export interface RawRecord {
    id: string
    userId: string
    event: string
    value: number | null
    timestamp: string
}

export interface CleanedRecord {
    id: string
    userId: string
    event: string
    value: number
    timestamp: string
}

export interface CleaningRule {
    allowNullValue: boolean
    requireValidTimestamp: boolean
    deduplicateBy: Array<keyof RawRecord>
}

export interface CleaningResult {
    cleaned: CleanedRecord[]
    invalid: RawRecord[]
}

export function buildDefaultRules(): CleaningRule {
    return {
        allowNullValue: false,
        requireValidTimestamp: true,
        deduplicateBy: ['id', 'userId', 'event', 'timestamp'],
    }
}

function isValidTimestamp(value: string): boolean {
    const time = Date.parse(value)
    return Number.isFinite(time)
}

export function applyCleaningPipeline(data: RawRecord[], rule: CleaningRule): CleaningResult {
    const invalid: RawRecord[] = []

    const validated = data.filter((item) => {
        if (!rule.allowNullValue && (item.value === null || Number.isNaN(Number(item.value)))) {
            invalid.push(item)
            return false
        }
        if (rule.requireValidTimestamp && !isValidTimestamp(item.timestamp)) {
            invalid.push(item)
            return false
        }
        return true
    })

    const normalized: CleanedRecord[] = validated.map((item) => ({
        id: String(item.id),
        userId: String(item.userId),
        event: String(item.event),
        value: Number(item.value),
        timestamp: new Date(item.timestamp).toISOString(),
    }))

    const seen = new Set<string>()
    const deduplicated: CleanedRecord[] = []

    for (const record of normalized) {
        const key = rule.deduplicateBy.map((field) => String((record as unknown as Record<string, unknown>)[field])).join('|')
        if (seen.has(key)) {
            continue
        }
        seen.add(key)
        deduplicated.push(record)
    }

    return {
        cleaned: deduplicated,
        invalid,
    }
}
