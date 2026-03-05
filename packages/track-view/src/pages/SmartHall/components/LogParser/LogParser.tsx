import React from 'react'
import LogInput from './LogInput'
import LogResult from './LogResult'
import ParserSteps from './ParserSteps'
import { useLogParser } from './useLogParser'
import './LogParser.less'

export const LogParser: React.FC = () => {
  const {
    loading,
    currentStep,
    parseResult,
    inputText,
    setInputText,
    handleParse,
    handleDispatch,
  } = useLogParser()

  return (
    <div className="log-parser-wrapper">
      <div className="log-parser-container">
        {/* 左侧：原始日志输入 */}
        <LogInput
          inputText={inputText}
          setInputText={setInputText}
          loading={loading}
          onParse={handleParse}
        />

        {/* 右侧：结构化结果 */}
        <LogResult
          loading={loading}
          parseResult={parseResult}
          inputText={inputText}
          onDispatch={handleDispatch}
        />
      </div>

      {/* 底部：技术链路展示 */}
      <ParserSteps currentStep={currentStep} />
    </div>
  )
}
