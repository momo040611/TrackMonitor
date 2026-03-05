import React from 'react'

interface StatisticCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bg: string
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon, color, bg }) => (
  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <div
      style={{
        textAlign: 'center',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: bg,
        width: '100%',
      }}
    >
      <div style={{ fontSize: 14, color: '#666', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ marginRight: '8px', fontSize: 20 }}>{icon}</span>
        {value}
      </div>
    </div>
  </div>
)

export default StatisticCard
