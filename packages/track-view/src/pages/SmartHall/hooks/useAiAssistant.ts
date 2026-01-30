import { useAsync } from '../../../utils/use-async'
import { AiService } from '../services/useAiAssistant'

export const useAiAssistant = () => {
  const {
    run: runCodeGen,
    data: codeResult,
    isLoading: isCodeLoading,
    error: codeError,
  } = useAsync<string>()

  const { run, data, isLoading, error } = useAsync<string>()

  const handleGenerate = (input: string) => {
    run(AiService.generateCode(input))
  }

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
