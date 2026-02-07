import type { CleanedRecord } from '../data-cleaning'

export interface AggregatedMetric {
    event: string
    count: number
    userCount: number
    avgValue: number
}

export interface TimeBucketMetric {
    bucket: string
    event: string
    count: number
}

export interface AggregationSummary {
    totalEvents: number
    uniqueUsers: number
    eventTypes: number
    globalAvgValue: number
}

export interface AggregationResult {
    summary: AggregationSummary
    byEvent: AggregatedMetric[]
    byTimeBucket: TimeBucketMetric[]
}

interface SampleRecord {
    id: string
    userId: string
    event: string
    value: number
    bucket: string
}

export function aggregateFromCleaned(records: CleanedRecord[]): AggregationResult {
    const totalEvents = records.length
    const uniqueUsers = new Set(records.map((r) => r.userId)).size
    const eventTypes = new Set(records.map((r) => r.event)).size
    const globalAvgValue =
        records.length > 0 ? records.reduce((sum, r) => sum + r.value, 0) / records.length : 0

    const byEventMap = new Map<string, { count: number; userSet: Set<string>; valueSum: number }>()
    const byTimeBucketMap = new Map<string, Map<string, number>>()

    for (const r of records) {
        const current = byEventMap.get(r.event) ?? {
            count: 0,
            userSet: new Set<string>(),
            valueSum: 0,
        }
        current.count += 1
        current.userSet.add(r.userId)
        current.valueSum += r.value
        byEventMap.set(r.event, current)

        // 按小时生成时间窗口 bucket，例如 "10:00"
        const date = new Date(r.timestamp)
        const hour = Number.isNaN(date.getTime()) ? '00' : String(date.getHours()).padStart(2, '0')
        const bucketKey = `${hour}:00`

        const bucketMap = byTimeBucketMap.get(bucketKey) ?? new Map<string, number>()
        const prev = bucketMap.get(r.event) ?? 0
        bucketMap.set(r.event, prev + 1)
        byTimeBucketMap.set(bucketKey, bucketMap)
    }

    const byEvent: AggregatedMetric[] = []
    byEventMap.forEach((value, key) => {
        byEvent.push({
            event: key,
            count: value.count,
            userCount: value.userSet.size,
            avgValue: value.count > 0 ? value.valueSum / value.count : 0,
        })
    })

    const byTimeBucket: TimeBucketMetric[] = []
    byTimeBucketMap.forEach((bucketMap, bucket) => {
        bucketMap.forEach((count, event) => {
            byTimeBucket.push({ bucket, event, count })
        })
    })

    return {
        summary: {
            totalEvents,
            uniqueUsers,
            eventTypes,
            globalAvgValue,
        },
        byEvent,
        byTimeBucket,
    }
}

export function buildSampleAggregations(): AggregationResult {
    const records: SampleRecord[] = [
        { id: '1', userId: 'u1', event: 'click', value: 10, bucket: '10:00' },
        { id: '2', userId: 'u1', event: 'click', value: 5, bucket: '10:00' },
        { id: '3', userId: 'u2', event: 'view', value: 3, bucket: '10:05' },
        { id: '4', userId: 'u3', event: 'click', value: 8, bucket: '10:10' },
    ]

    // 复用 aggregateFromCleaned 的逻辑，先映射成 CleanedRecord 结构
    const cleanedLike: CleanedRecord[] = records.map((r) => ({
        id: r.id,
        userId: r.userId,
        event: r.event,
        value: r.value,
        // 这里将 bucket 映射回一个可解析的时间字符串占位
        timestamp: `2025-01-01T${r.bucket}:00Z`,
    }))

    return aggregateFromCleaned(cleanedLike)
}
