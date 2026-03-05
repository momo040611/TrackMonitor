import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Typography } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import type { RootCauseResult } from '../useRootCauseAnalysis'
import { RISK_THRESHOLD, COLORS } from '../constants'

const { Text, Title } = Typography

interface TopologyGraphProps {
  results: RootCauseResult[]
  onItemClick: (item: RootCauseResult) => void
  triggerResize: boolean
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({
  results,
  onItemClick,
  triggerResize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootNodeRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [svgPaths, setSvgPaths] = useState<string[]>([])

  const calculatePaths = useCallback(() => {
    if (!containerRef.current || !rootNodeRef.current || results.length === 0) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const rootRect = rootNodeRef.current.getBoundingClientRect()
    const startX = rootRect.right - containerRect.left
    const startY = rootRect.top + rootRect.height / 2 - containerRect.top

    const newPaths = results.map((_, index) => {
      const itemEl = itemRefs.current[index]
      if (!itemEl) return ''
      const itemRect = itemEl.getBoundingClientRect()
      const endX = itemRect.left - containerRect.left
      const endY = itemRect.top + itemRect.height / 2 - containerRect.top
      const controlPointX = (startX + endX) / 2
      return `M ${startX},${startY} C ${controlPointX},${startY} ${controlPointX},${endY} ${endX},${endY}`
    })
    setSvgPaths(newPaths)
  }, [results])

  useEffect(() => {
    const timer = setTimeout(calculatePaths, 100)
    window.addEventListener('resize', calculatePaths)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculatePaths)
    }
  }, [calculatePaths, triggerResize])

  if (results.length === 0) {
    return (
      <div className="topology-empty">
        <Text type="secondary">暂无数据</Text>
      </div>
    )
  }

  const topRisks = results
    .filter((r) => r.score > RISK_THRESHOLD.HIGH)
    .slice(0, 2)
    .map((r) => r.value)

  return (
    <div className="topology-wrapper">
      <div className="topology-viewport" ref={containerRef}>
        <svg className="connections-layer">
          {svgPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={results[i]?.score > RISK_THRESHOLD.HIGH ? '#ffccc7' : '#e8e8e8'}
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="root-node" ref={rootNodeRef}>
          异常总集
          <br />
          (N={results.length})
        </div>
        <div className="leaf-nodes-column">
          {results.map((item, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`leaf-node-card ${item.score > RISK_THRESHOLD.HIGH ? 'high-risk' : ''}`}
              onClick={() => onItemClick(item)}
            >
              <div className="score-badge">{item.score}%</div>
              <Text type="secondary" className="dimension-text">
                {item.dimension}
              </Text>
              <h4>{item.value}</h4>
              <div
                className="node-indicator"
                style={{
                  background: item.score > RISK_THRESHOLD.HIGH ? COLORS.HIGH_RISK : COLORS.LOW_RISK,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {topRisks.length > 0 && (
        <div className="topology-conclusion">
          <Title level={5} type="danger" className="conclusion-title">
            <WarningOutlined /> AI 综合排查结论：
          </Title>
          <Text>
            核心根因指向 <b>{topRisks.join('</b> 和 <b>')}</b>。
          </Text>
        </div>
      )}
    </div>
  )
}
