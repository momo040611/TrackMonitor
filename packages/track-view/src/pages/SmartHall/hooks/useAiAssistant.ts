import { useAsync } from '../../../utils/use-async'
import { AiService } from '../services/aiService'

export const useAiAssistant = () => {
  const {
    run: runCodeGen,
    data: codeResult,
    isLoading: isCodeLoading,
    error: codeError,
  } = useAsync<string>()

  const generateCode = (requirement: string) => {
    runCodeGen(AiService.generateCode(requirement))
  }

  return {
    copilot: {
      generate: generateCode,
      result: codeResult,
      isLoading: isCodeLoading,
      error: codeError,
    },
  }
}
